var engine = function(){};
engine.task = require("./task").task;
engine.util = require("./util");

var task = function(id, client_instance){
    var self = this;
    self.client = client_instance;
    self.id = id;
};

task.make = function(options){
    return new task(options.id, 
                    options.client);
};

task.create = function(options){
    return task.make({
        id: engine.util.makeUUID({prefix:'task'}),
        client: options.client
    });
};

task.prototype.run = function(){
    var self = this;
    self.client.run(self);
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