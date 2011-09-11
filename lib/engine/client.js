var engine = function(){};
engine.util = require("./util");
engine.task = require("./task").task;

var EventEmitter = require("events").EventEmitter,
    Checklist = require("../mixins/checklist").Checklist,
    util = require("util");

var client = function(id, intake_manifold, crankshaft_endpoint, 
                      task_creation_strategy){
    var self = this;
    self.id = id;
    self.sending_socket = intake_manifold;
    self.listening_endpoint = crankshaft_endpoint;
    self.task_creation_strategy = task_creation_strategy;
};

client.make = function(options){
    var new_client = new client(options.id,
                                options.sending_socket,
                                options.listening_endpoint,
                                options.task_creation_strategy);

    return new_client;
};

client.create = function(config){
    var defaults = {
	sending_endpoint: "tcp://127.0.0.1:5555",
	listening_endpoint: "tcp://127.0.0.1:5556"
    };
    var options;
    options = (config || {}).__proto__ = defaults;

    var context = require("zmq");
    var sending_socket = context.createSocket("push");
    sending_socket.connect("tcp://127.0.0.1:5555");

    var task_creation_strategy = function(client){
        return engine.task.create({
            client: client
        });
    };

    return client.make({
        id: engine.util.makeUUID({prefix:"client"}),
        sending_socket: sending_socket,
        listening_endpoint: "tcp://127.0.0.1:5556",
        task_creation_strategy: task_creation_strategy
    });    
};

client.prototype.createTask = function(){
    return this.createTaskFromStrategy(this);
};

client.prototype.createTaskFromStrategy = function(client){
    return this.task_creation_strategy.call(null, client);
};

client.prototype.run = function(task){
    var self = this;
    
    var data = {
        task_id: task.id,
	context: task.getContext(),
	locals: task.getLocals(),
	code: task.getCode()
    };

    // TODO: push seritalization into its own strategy
    self.sending_socket.send(JSON.stringify(data));
    console.log("client", JSON.stringify(data));
};

client.prototype.close = function(){
    var self = this;
    self.sending_socket.close();
};

exports.client = client;