var engine_util = require("./util"),
    task = require("./client/task").task;

var EventEmitter = require("events").EventEmitter,
    util = require("util");

var task_identity_generator = require('./client/task_identity_generator').task_identity_generator;

var client = function(sending_socket, listening_socket, task_klass,
		      task_identity_generator){
    var self = this;
    self.sending_socket = sending_socket;
    self.listening_socket = listening_socket;
    self.task_klass = task_klass;
    self.task_identity_generator = task_identity_generator;
    self.tasks = {};
};

client.make = function(options){
    var new_client = new client(options.sending_socket,
                                options.listening_socket,
			        options.task_klass,
			        options.task_identity_generator);

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

    var generator = task_identity_generator.create();

    return client.make({
        id: engine_util.makeUUID({prefix:"client"}),
	task_klass: task,
        sending_socket: sending_socket,
        listening_socket: listening_socket,
        task_identity_generator: generator
    });    
};

client.prototype.createTask = function(){
    //var task = this.createTaskFromStrategy(this);
    //this.listening_socket.subscribe(task.id);
    //this.tasks[task.id] = task;
    //return task;
    var id = this.task_identity_generator.generate();
    this.listening_socket.subscribe(id);

    var new_task = this.task_klass.make({id: id});

    this.tasks[id] = new_task;

    return new_task;
};

client.prototype.createTaskFromStrategy = function(client){
    return this.task_creation_strategy.call(null, client);
};

client.prototype.run = function(task){
    var self = this;
    
    var data = {
        task_id: task.getId(),
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