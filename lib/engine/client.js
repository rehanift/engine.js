var engine = function(){};
engine.util = require("./util");
engine.task = require("./task").task;

var EventEmitter = require("events").EventEmitter,
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
    var provide_defaults = require("./helpers/provide_defaults");

    var options = provide_defaults(config,{
	sending_endpoint: "ipc://intake-listener.ipc",
	listening_endpoint: "ipc://exhaust-publisher.ipc"
    });

    var context = require("zmq");
    var sending_socket = context.createSocket("push");
    sending_socket.connect(options.sending_endpoint);

    var task_creation_strategy = function(client){
        return engine.task.create({
            client: client,
	    listening_endpoint: options.listening_endpoint
        });
    };

    return client.make({
        id: engine.util.makeUUID({prefix:"client"}),
        sending_socket: sending_socket,
        listening_endpoint: options.listening_endpoint,
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
};

client.prototype.close = function(){
    var self = this;
    self.sending_socket.close();
};

exports.client = client;