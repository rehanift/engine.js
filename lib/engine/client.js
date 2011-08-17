var engine = function(){};
engine.util = require("./util");
engine.task = require("./task").task;
engine.constants = require("./constants").constants;

var EventEmitter = require("events").EventEmitter,
    Checklist = require("../mixins/checklist").Checklist,
    util = require("util");

var client = function(options){
    var self = this;
    self.id = engine.util.makeUUID({prefix:"client"});

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
	self.cylinder_block.send(engine.constants.HANDSHAKE);
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
	if (data.toString() == engine.constants.READY){
	    self.emit("ready");
	    return true;
	} else if (data.toString() == engine.constants.HANDSHAKE) {
	    console.log("client received a handshake");
	    return true;
	}
	
        var parsed_data = JSON.parse(data.toString());
        var task = self.getRunningTask(parsed_data.running_task_id);
	
	if (typeof task == "undefined") {
	    throw "Client could not find Task reference to completed running task";
	}
	
        task.getCallback().call(null, data);

        self.emit("crankshaft results", data);
    });
    
    self.handleCheckoff = function(remaining_reqs){
        if (remaining_reqs.length == 0) {
            self.emit("client sockets ready");
        }
    };

    self.running_tasks = {};

    self.logger = context.createSocket("pull");
    self.logger.bind("ipc://logger.ipc",function(err){
	if (err) throw err;

	console.log("logger connected");
    });
    self.logger.on("message", function(data){
	console.log(data.toString());
    });
};
util.inherits(client, EventEmitter);
Checklist.call(client.prototype);

client.prototype.createTask = function(){
    var self = this;
    var task = new engine.task(self);
    return task;
};

client.prototype.run = function(task){
    var self = this;
    
    var running_task_id = engine.util.makeUUID({prefix:"running-task"});
    self.running_tasks[running_task_id] = task;

    var data = {
        running_task_id: running_task_id,
	context: task.getContext(),
	locals: task.getLocals(),
	code: task.getCode()
    };

    self.cylinder_block.send(JSON.stringify(data));
};

client.prototype.getRunningTask = function(id) {
    var self = this;

    var task = self.running_tasks[id];
    return task;
};

client.prototype.close = function(){
    var self = this;
    self.cylinder_block.close();
    self.crankshaft.close();
};

exports.client = client;