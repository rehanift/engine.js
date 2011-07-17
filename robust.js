var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    node_uuid = require('node-uuid'),
    spawn = require('child_process').spawn,
    vm = require("vm");    


var robust = function(options){
    var self = this;

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
	    self.emit("ready");
	    return true;
	} else {
	    // TODO: need safe JSON parsing
	    data = JSON.parse(data);
	    robust.util.info("Receiving results for task " + data['task_id']);
	    console.log(data);
	}
	
	var task = self.getTask(data["task_id"]);
	var process = self.processPool.get(data["process_id"]);
	process.addCompletedTask();
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
	proc = new robust.models.process();
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

robust.models.process = function(){
    var self = this;
    self.id = robust.util.makeUUID({prefix:"process"});
    self.process = spawn('node', ["child_process-v2.js",self.id]);
    self.task_completed = 0;
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
    if (because) message += " because:" + because;
    self.process.kill('SIGKILL');
    robust.util.info(message);
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