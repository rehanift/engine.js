var engine = function(){};
engine.task = require("./task").task;
engine.util = require("./util");

var task = function(id, client_instance, subscriber_socket, callback){
    var self = this;
    self.client = client_instance;
    self.id = id;
    self.subscriber_socket = subscriber_socket;
    self.callback = callback;
};

task.make = function(options){
    var new_task = new task(options.id, 
                            options.client,
                            options.subscriber_socket,
                            options.callback);

    new_task.subscriber_socket.on("message", function(data){
        var response = data.toString();
        var parts = response.split(' ');
        new_task.call_callback(parts[1]);
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

task.prototype.run = function(callback){
    var self = this;
    self.callback = callback;
    self.client.run(self);
};

task.prototype.call_callback = function(data){
    this.callback.call(null, data);
};

task.prototype.getCallback = function(){
    return this.callback;
};

task.prototype.setCallback = function(callback){
    this.callback = callback;
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