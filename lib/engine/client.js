var engine = function(){};
engine.util = require("./util");
engine.task = require("./task").task;
engine.constants = require("./constants").constants;

var EventEmitter = require("events").EventEmitter,
    Checklist = require("../mixins/checklist").Checklist,
    util = require("util");

var client = function(id, intake_manifold, crankshaft_endpoint){
    var self = this;
    self.id = id;
    self.sending_socket = intake_manifold;
    self.listening_endpoint = crankshaft_endpoint;
    self.running_tasks = {};
};

/**
 * How do we test factories?
 *   - Create a Test factory that creates new objects
 */

client.create = function(config){
    var defaults = {
	sending_endpoint: "ipc://intake_manifold.ipc",
	listening_endpoint: "ipc://crankshaft.ipc"
    };
    var options;
    options = (config || {}).__proto__ = defaults;

    var context = require("zeromq");
    var sending_socket = context.createSocket("push");
    sending_socket.connect(options.sending_endpoint);

    var id = engine.util.makeUUID({prefix:"client"});
    
    return new client(id, sending_socket, options.listening_endpoint);
};

client.prototype.createTask = function(){
    var self = this;
    var task = engine.task.create(self);
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

    // TODO: push seritalization into its own strategy
    self.sending_socket.send(JSON.stringify(data));
};

// TODO: Is this needed any longer?
client.prototype.getRunningTask = function(id) {
    var self = this;

    var task = self.running_tasks[id];
    return task;
};

client.prototype.close = function(){
    var self = this;
    self.sending_socket.close();
};

exports.client = client;