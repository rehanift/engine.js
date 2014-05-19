var engine_util = require("../util"),
    util = require("util"), 
    events = require("events");

var task = function(id, client_instance){
    var self = this;
    self.client = client_instance;
    self.id = id;
    self.locals = {};
    self.context = "(function(locals){ return {} })";
};
util.inherits(task,events.EventEmitter);

task.make = function(options){
    var new_task = new task(options.id, 
                            options.client);

    return new_task;
};

task.create = function(options){
    var task_id = engine_util.makeUUID({prefix:'task'});
    
    return task.make({
        id: task_id,
        client: options.client
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