var node_uuid = require('node-uuid');

var task_identity_generator = function(){};

task_identity_generator.make = function(options){
    var generator = new task_identity_generator();
    return generator;
};

task_identity_generator.create = function(config){
    return task_identity_generator.make();
};

task_identity_generator.prototype.generate = function(){
    return "task-" + node_uuid();
};

exports.task_identity_generator = task_identity_generator;