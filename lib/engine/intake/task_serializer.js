var task_serializer = function(){};

task_serializer.make = function(options){
    var new_task_serializer = new task_serializer();
    return new_task_serializer;
};

task_serializer.create = function(config){
    return task_serializer.make();
};

task_serializer.prototype.serialize = function(task){   
    var serialized_task = JSON.stringify({
	task_id: task.getId(),
	context: task.getContext(),
	code: task.getCode(),
	locals: task.getLocals()
    });
    return serialized_task;
};

exports.task_serializer = task_serializer;