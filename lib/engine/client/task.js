var engine_util = require("../util"),
    util = require("util"), 
    events = require("events");

var task = function(id){
    this.id = id;
};
util.inherits(task,events.EventEmitter);

task.make = function(options){
    var new_task = new task(options.id);

    return new_task;
};

task.restore_from_JSON = function(data){
    var translated_task = new task();
    translated_task.setId(data.task_id);
    translated_task.setContext(data.context);
    translated_task.setCode(data.code);
    translated_task.setLocals(data.locals);

    return translated_task;
};

task.prototype.getId = function(){
    return this.id;
};

task.prototype.setId = function(id){
    this.id = id;
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