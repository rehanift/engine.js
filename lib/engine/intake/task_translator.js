var task = require("../client/task").task;

var task_translator = function(){};

task_translator.make = function(){
    return new task_translator();
};

task_translator.create = function(){
    return task_translator.make();
};

task_translator.prototype.translate = function(raw_string){
    var task_as_JSON = JSON.parse(raw_string);

    var translated_task = task.restore_from_JSON(task_as_JSON);
    return translated_task;
};

exports.task_translator = task_translator;