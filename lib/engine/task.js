var engine = function(){};
engine.task = require("./task").task;
engine.util = require("./util");
var util = require("util"), events = require("events");

var task = function(id, client_instance, subscriber_socket){
    var self = this;
    self.client = client_instance;
    self.id = id;
    self.subscriber_socket = subscriber_socket;
};
util.inherits(task,events.EventEmitter);

task.make = function(options){
    var new_task = new task(options.id, 
                            options.client,
                            options.subscriber_socket);

    new_task.subscriber_socket.on("message", function(data){
        var response = data.toString();
        var delimiter_pos = response.indexOf(' ');
        var payload = response.substring(delimiter_pos + 1);

        var parsed_payload = JSON.parse(payload);
        if (typeof parsed_payload.console != "undefined") {
            new_task.emit("output", parsed_payload.console);
        } else if (typeof parsed_payload.last_eval != "undefined") {
            new_task.emit("eval", parsed_payload.last_eval);
        }
    });

    return new_task;
};

task.create = function(options){
    var task_id = engine.util.makeUUID({prefix:'task'});

    var context = require('zeromq');
    var subscriber_socket = context.createSocket('subscribe');
    subscriber_socket.connect("ipc://exhaust_publisher.ipc");
    subscriber_socket.subscribe(task_id);

    return task.make({
        id: task_id,
        client: options.client,
        subscriber_socket: subscriber_socket
    });
};

task.prototype.run = function(){
    var self = this;
    self.client.run(self);
};

task.prototype.getContext = function(){
    return this.context;
};

task.prototype.setContext = function(context){
    this.context = context;
};

task.prototype.getLocals = function(){
    return this.locals;
};

task.prototype.setLocals = function(locals){
    this.locals = locals;
};

task.prototype.getCode = function(){
    return this.code;
};

task.prototype.setCode = function(code){
    this.code = code;
};

exports.task = task;