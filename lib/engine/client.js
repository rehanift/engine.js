var engine = function(){};
engine.util = require("./util");
engine.task = require("./task").task;

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
util.inherits(client, EventEmitter);
Checklist.call(client.prototype);

// This might be a problem?
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
        running_task_id: running_task_id 
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