var engine_util = require("./util"),
    task = require("./client/task").task;

var EventEmitter = require("events").EventEmitter,
    util = require("util");

var client = function(id, sending_socket, listening_socket, 
                      task_creation_strategy){
    var self = this;
    self.id = id;
    self.sending_socket = sending_socket;
    self.listening_socket = listening_socket;
    self.task_creation_strategy = task_creation_strategy;
    self.tasks = {};
};

client.make = function(options){
    var new_client = new client(options.id,
                                options.sending_socket,
                                options.listening_socket,
                                options.task_creation_strategy);

    new_client.listening_socket.on("message", function(data){
        var response = data.toString();
        var delimiter_pos = response.indexOf(' ');
        var payload = response.substring(delimiter_pos + 1);
    
        var parsed_payload = JSON.parse(payload);
	var task = new_client.find_task_by_id(parsed_payload.task_id);
        if (typeof parsed_payload.console != "undefined") {
            task.emit("output", parsed_payload.console);
        } else if (typeof parsed_payload.last_eval != "undefined") {
            task.emit("eval", parsed_payload.last_eval);
	    new_client.listening_socket.unsubscribe(task.id);
        }
    });


    return new_client;
};

client.create = function(config){
    var provide_defaults = require("./helpers/provide_defaults");

    var options = provide_defaults(config,{
	sending_endpoint: "ipc:///tmp/intake-listener.ipc",
	listening_endpoint: "ipc:///tmp/exhaust-publisher.ipc"
    });

    var context = require("zmq");
    var sending_socket = context.createSocket("push");
    sending_socket.connect(options.sending_endpoint);

    var listening_socket = context.createSocket('subscribe');
    listening_socket.connect(options.listening_endpoint);

    var task_creation_strategy = function(client){
        return task.create({
            client: client,
	    listening_endpoint: options.listening_endpoint
        });
    };

    return client.make({
        id: engine_util.makeUUID({prefix:"client"}),
        sending_socket: sending_socket,
        listening_socket: listening_socket,
        task_creation_strategy: task_creation_strategy
    });    
};

client.prototype.createTask = function(){
    var task = this.createTaskFromStrategy(this);
    this.listening_socket.subscribe(task.id);
    this.tasks[task.id] = task;
    return task;
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

client.prototype.find_task_by_id = function(task_id){
    return this.tasks[task_id];
};

client.prototype.close = function(){
    var self = this;
    self.sending_socket.close();
    self.listening_socket.close();
};

exports.client = client;