var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    node_uuid = require('node-uuid'),
    spawn = require('child_process').spawn,
    vm = require("vm"),
    context = require('zeromq');

var Checklist = require("./lib/checklist.js").Checklist;



var robust = function(options){
    var self = this;
    
    /*
    process.on('SIGINT', function(){
	console.log("\n");
	console.log("======================================================================");
	console.log("POOL STATISTICS");
	[self.taskPool, self.processPool, self.timeoutPool].forEach(function(pool){
	    console.log("\t",pool.getName(), " - Size: ", pool.getSize(), "\n");
	});
	console.log("======================================================================");
	console.log("PROCESS STATISTICS");
	Object.keys(self.processPool.items).forEach(function(key){
	    console.log("\t",key," - Completed: ", self.processPool.get(key).getCompletedTasks(),"\n");
	});
	console.log("======================================================================","\n");

	process.kill(process.pid, 'SIGTERM');
    });

     */
    self.taskPool = new robust.models.pool("tasks");
    self.processPool = new robust.models.pool("processes");
    self.timeoutPool = new robust.models.pool("timeouts");

    self.createTask = function(){
	var task = new robust.models.task(self);
	self.addTask(task);
	return task;
    };

    self.addTask = function(task){
	self.taskPool.add(task);
    };

    self.getTask = function(task_id){
	return self.taskPool.get(task_id);
    };

    var context = require("zeromq");

    self.id = robust.util.makeUUID({prefix:"client"});

    self.results_socket = context.createSocket("pull");
    self.code_socket = context.createSocket("push");

    self.results_socket.on("message", function(data){
	if (data == robust.constants.HANDSHAKE) {
	    // do nothing
	    return true;
	} else if (data == robust.constants.READY) {
	    console.log("Ready handshake");
	    self.emit("ready");
	    return true;
	} else {
	    // TODO: need safe JSON parsing
	    data = JSON.parse(data);
	    robust.util.info("Receiving results for task " + data['task_id']);
	    console.log(data);
	}
	
	var task = self.getTask(data["task_id"]);
	// TODO: We no longer know from which process the results came from
	//var process = self.processPool.get(data["process_id"]);
	//process.addCompletedTask();
	if (task) {
	    task.emit("complete", data);

	    if (task.hasCallback()) {
		var callback = task.getCallback();
		callback.call(null, data);
	    }

	    self.taskPool.remove(task.id);
	}

	return true;
    });

    // TODO: add namespacing to ipc sockets
    self.code_socket.bind("ipc://code.ipc", function(err){
	if (err) throw err;
	self.code_socket.send(robust.constants.HANDSHAKE);
	robust.util.info("code socket bound successfully");
    });
    
    self.results_socket.bind("ipc://results.ipc", function(err){
	if (err) throw err; 
	robust.util.info("results socket bound successfully");
    });
        
    var proc;
    
    for (var i = 0; i < options.num_children; i++) {
	proc = new robust.models.process({
	    file:"cylinder.js"
	});
	self.processPool.add(proc);
    }
    
};
util.inherits(robust, EventEmitter);

robust.constants = {
    HANDSHAKE:"0",
    READY:"1"
};

robust.util = function(){};
robust.util.makeUUID = function(options){    
    var uuid = node_uuid();
    var output = [];

    if (options.prefix) {
	output.push(options.prefix);
    }

    output.push(uuid);

    return output.join("-");
};

robust.util.info = function(message){
    console.log("[INFO] " + message);
};

robust.util.warn = function(message){
    console.log("[WARN] " + message);
};

robust.models = function(){};
robust.models.task = function(instance){
    var self = this;
    self.instance = instance;
    
    self.id = robust.util.makeUUID({prefix:"task"});

    self.run = function(config, callback){
	robust.util.info("Running code for task " + self.id);
	config['task_id'] = self.id;
	config = JSON.stringify(config);
	if (typeof callback === 'function') {
	    self.callback = callback;
	}
	self.instance.code_socket.send(config);
    };
};
util.inherits(robust.models.task, EventEmitter);

robust.models.task.prototype.hasCallback = function(){
    var self = this;
    return typeof(self.callback) == "function" ? true : false;
};

robust.models.task.prototype.getCallback = function(){
    var self = this;
    return self.callback;
};

/**
 * Creates a new process
 */
robust.models.process = function(options){
    var self = this;
    self.id = robust.util.makeUUID({prefix:"process"});
    if (typeof options.file == "undefined") {
	throw "The name of a file is needed to spawn a new process";
    }
    self.process = spawn('node', [options.file].concat(options.arguments));
};

robust.models.process.prototype.addCompletedTask = function(){
    var self = this;
    self.task_completed++;
};

robust.models.process.prototype.getCompletedTasks = function(){
    var self = this;
    return self.task_completed;
};

robust.models.process.prototype.kill = function(because){
    var self = this;
    var message = "Process ("+self.id+") is being killed";
    if (because) {
	console.log(because);
    }
    self.process.kill('SIGKILL');
};

robust.models.timeout = function(config){
    var self = this;
    self.id = config.task_id;
    self.process_id = config.process_id;
    self.timeout_id = config.timeout_id;
};

robust.models.timeout.prototype.clear = function(){
    var self = this;
    robust.util.info("Timeout - clearing timeout for " + self.id);
    clearTimeout(self.timeout_id);
};

robust.models.pool = function(name){
    var self = this;
    self.name = name;
    self.id = robust.util.makeUUID({prefix:"pool"});
    self.items = {};
};

robust.models.pool.prototype.add = function(item){
    var self = this;
    if (typeof(item.id) == "undefined") {
	robust.util.warn("Pool - " + self.name + ": Trying to add an item with no id");
	return false;
    }

    if (typeof(self.items[item.id]) != "undefined") {
	robust.util.warn("Pool - " + self.name + ": Trying to add an item that already exists in the pool");
	return false;
    }
    
    robust.util.info("Pool - " + self.name + ": Adding item to pool ("+ item.id +")");
    self.items[item.id] = item;
    
    return true;
};

robust.models.pool.prototype.get = function(id){
    var self = this;
    var item = self.items[id];
    
    if (typeof(item) == "undefined") {
	robust.util.warn("Pool - " +  self.name + ": Trying to get an item from a pool that doesn't exist." + id);
    }
    
    return item;
};

robust.models.pool.prototype.remove = function(id){
    var self = this;
    var item = self.items[id];
    
    if (typeof(item) == "undefined") {
	robust.util.warn("Pool - " + self.name + ": Trying to remove an item from a pool that doesn't exist." + id);
	return false;
    }

    delete self.items[id];
    robust.util.info("Pool - " + self.name + ": Removed an item from a pool" + id);
    
    return true;
};

robust.models.pool.prototype.getSize = function(){
  var self = this;
  return Object.keys(self.items).length;
};

robust.models.pool.prototype.getName = function(){
  var self = this;
  return self.name;
};

robust.worker = function(options){
    var context = require('zeromq');
    var self = this;

    self.process_id = options.process_id;

    self.code_receiver = context.createSocket("pull");
    self.results_sender = context.createSocket("push");

    self.code_receiver.connect("ipc://code.ipc");
    self.results_sender.connect("ipc://results.ipc");

    self.code_receiver.on("message", function(data){
	if (data == robust.constants.HANDSHAKE) {
	    self.results_sender.send(robust.constants.READY);
	    return true;	    
	}
	
	var config = JSON.parse(data);
	var code = config['code'];
	var context = config['context'];
	var locals = config['locals'];
	var task_id = config['task_id'];
    
	var sandbox = (eval(context))(locals);
	
	var results = robust.worker.execute(code, sandbox);
	
	var response = {
    	    task_id: task_id,
	    process_id: self.process_id,
    	    returned_data: results[0],
    	    context: results[1]
	};
	
	self.results_sender.send(JSON.stringify(response));		
	
	return true;
    });

    self.results_sender.send(robust.constants.HANDSHAKE);
};

robust.worker.execute = function(code, context) {
    var returned_data;
    return (function(code) {
	try {
	    returned_data = vm.runInNewContext(this.toString(), context);
	}
	catch (e) {
	    returned_data =  e.name + ': ' + e.message;
	}
	    
	return [returned_data, context];
    }).call(code);
};

exports.robust = robust;

////////////////////////////////////////////////////////////////////////////////

var engine = function(){};

engine.cylinder = function(options){
    var context = require('zeromq');
    var self = this;

    // Theres probably a better way to do this
    var defaults = {
	intake: {
	    endpoint: "ipc://code.ipc",
	    callback: function(data){
		console.log("You should not see me!");
	    }
	},
	compression: {
	    endpoint: "ipc://compression.ipc",
	    callback: function(data){
		console.log("Compression callback");
	    },
	    timeout: 10000
	}
    };
    
    var intake_endpoint = defaults.intake.endpoint;
    var intake_callback = defaults.intake.callback;
    var compression_endpoint = defaults.compression.endpoint;
    var compression_callback = defaults.compression.callback;
    var compression_timeout = defaults.compression.timeout;

    if(typeof options != "undefined"){
	if (typeof options.intake != "undefined") {
	    if (typeof options.intake.endpoint != "undefined") {
		intake_endpoint = options.intake.endpoint;
	    }

	    if (typeof options.intake.callback != "undefined") {
		intake_callback = options.intake.callback;
	    }
	}
	if (typeof options.compression != "undefined") {
	    if (typeof options.compression.endpoint != "undefined") {
		compression_endpoint = options.compression.endpoint;
	    }

	    if (typeof options.compression.callback != "undefined") {
		compression_callback = options.compression.callback;
	    }

	    if (typeof options.compression.timeout != "undefined") {
		compression_timeout = options.compression.timeout;
	    }
	}
    }

    self.id = robust.util.makeUUID({prefix:"cylinder"});

    self.intake = context.createSocket("pull");
    self.results_sender = context.createSocket("push");
    self.compression = context.createSocket("req");
    
    self.intake.connect(intake_endpoint);
    self.results_sender.connect("ipc://results.ipc");
    self.compression.connect(compression_endpoint);

    // create a new service
    self.pistonProcess = new robust.models.process({
	file:"piston.js",
	arguments:[self.id]
    });

    self.pistonTimeout = null;

    self.intake.on("message", function(data){
	intake_callback(data);

    	if (data == robust.constants.HANDSHAKE) {
    	    self.results_sender.send(robust.constants.READY);
    	    return true;
    	}
	
	self.ignite(data);
    });

    self.ignite = function(data){
    	self.compression.send(data);
	self.pistonTimeout = setTimeout(function(){
	    self.pistonProcess.kill();
	    self.pistonProcess = new robust.models.process({
		file:"piston.js",
		arguments:[self.id]
	    });
	    clearTimeout(self.pistonTimeout);
	}, compression_timeout);
    };
    
    self.compression.on("message", function(data){
	clearTimeout(self.pistonTimeout);
	compression_callback(data);
    	// self.results_sender.send(data);
    });
    
    /* This is causing the spec to block. I suspect that its hanging on the missing endpoint */
    //self.results_sender.send(robust.constants.HANDSHAKE);

    self.close = function(){
    	self.pistonProcess.kill();
    	self.intake.close();
    	self.results_sender.close();
    	self.compression.close();
	
    };
};

engine.piston = function(options){
    var self = this;

    self.id = robust.util.makeUUID({prefix: "piston"});
    
    process.on('SIGINT', function() {
        self.code_responder.close();
    });

    self.server = new engine.piston.server();
};

engine.piston.fire = function(data){
    var config = JSON.parse(data);
    var code = config['code'];
    var context = config['context'];
    var locals = config['locals'];
    
    var sandbox = (eval(context))(locals);
    
    var returned_data;
    var results = (function(code) {
	try {
	    returned_data = vm.runInNewContext(this.toString(), sandbox);
	}
	catch (e) {
	    returned_data =  e.name + ': ' + e.message;
	}
	
	return [returned_data, context];
    }).call(code);
    
    return {
    	returned_data: results[0],
    	context: results[1]
    };
};

engine.piston.server = function(){
    var self = this;
    self.started = false;
    self.running = function(){
	return self.started;
    };

    var context = require('zeromq');
    self.code_responder = context.createSocket('rep');

    self.code_responder.on('message', function(data) {
        var response = engine.piston.fire(data);
	self.code_responder.send(JSON.stringify(response));		
	
	return true;
    });

    self.start = function(endpoint, callback){
	self.code_responder.bind(endpoint, function(err) {
            if(err) {
		console.log(err);
            } else {
		self.started = true;
		if (typeof callback != "undefined") {
		    callback.call();
		}
	    }
	});  
    };

    self.stop = function(callback){
	self.code_responder.close();
	self.started = false;
	if (typeof callback != "undefined") {
	    callback.call();
	}
    };

    self.getSockets = function(){
        return [self.code_responder];
    };    

};

engine.client = function(options){
    var self = this;
    self.id = robust.util.makeUUID({prefix:"client"});

    var context = require("zeromq");

    var defaults = {
        cylinder_block: "ipc://cylinder_block.ipc",
        crankshaft: "ipc://crankshaft.ipc"
    };

    self.setRequirements([
        "crankshaft",
        "cylinder block"
    ]);
    
    var cylinder_block_endpoint = defaults.cylinder_block;
    var crankshaft_endpoint = defaults.crankshaft;

    if (typeof(options) != "undefined") {
        if (typeof(options.cylinder_block) != "undefined") {
            cylinder_block_endpoint = options.cylinder_block;
        }

        if (typeof(options.crankshaft) != "undefined") {
            crankshaft_endpoint = options.crankshaft;
        }
    }
    
    self.cylinder_block = context.createSocket("push");
    self.cylinder_block.bind(cylinder_block_endpoint, function(err){
        if (err) {
            throw err;
        }

        self.emit("cylinder block ready");
        self.checkoff("cylinder block", self.handleCheckoff);
    });

    self.crankshaft = context.createSocket("pull");
    self.crankshaft.bind(crankshaft_endpoint, function(err){
        if (err) {
            throw err;
        }

        self.emit("crankshaft ready");
        self.checkoff("crankshaft", self.handleCheckoff);
    });

    self.crankshaft.on("message", function(data){
        var parsed_data = JSON.parse(data);
        var task = self.getRunningTask(parsed_data.running_task_id);

        //if (task && task.getCallback()) {
        //    task.getCallback().call(null, data);
        //}

        self.emit("crankshaft results", data);
    });

    self.handleCheckoff = function(remaining_reqs){
        if (remaining_reqs.length == 0) {
            self.emit("ready");
        }
    };

    self.running_tasks = {};
};
util.inherits(engine.client, EventEmitter);
Checklist.call(engine.client.prototype);


engine.client.prototype.createTask = function(){
    var self = this;
    var task = new engine.task(self);
    return task;
};

engine.client.prototype.run = function(task){
    var self = this;
    
    var running_task_id = robust.util.makeUUID({prefix:"running-task"});
    self.running_tasks[running_task_id] = task;

    var data = {
        running_task_id: running_task_id 
    };

    self.cylinder_block.send(JSON.stringify(data));
};

engine.client.prototype.getRunningTask = function(id) {
    var self = this;

    var task = self.running_tasks[id];
    return task;
};

engine.client.prototype.close = function(){
    var self = this;
    self.cylinder_block.close();
    self.crankshaft.close();
};

engine.task = function(client_instance){
    var self = this;
    self.client = client_instance;
    
    self.id = robust.util.makeUUID({prefix:"task"});
};

engine.task.prototype.run = function(){
    var self = this;
    self.client.run(self);
};

engine.task.prototype.getCallback = function(){
    return this.callback;
};

engine.task.prototype.setCallback = function(callback){
    this.callback = callback;
};

exports.engine = engine;