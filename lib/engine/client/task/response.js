var util = require('util');

var TaskResponse = function(params) {
  this.params = params;
}

TaskResponse.prototype.getTaskId = function(){
    return this.params.task_id;
};

TaskResponse.prototype.getEvaluation = function(){
  return this.params.response.evaluation;
}

TaskResponse.prototype.getGlobals = function(){
  return this.params.response.globals;
}

TaskResponse.prototype.getOutput = function(){
    return this.params.console;
};

TaskResponse.prototype.hasOutput = function(){
    return (typeof this.params.console != "undefined");
};

TaskResponse.prototype.toString = function(){
  return "[TaskResponse result: " + util.inspect(this.params) + "]";
}

TaskResponse.prototype.isError = function(){
  return this.params.response && this.params.response.error;
}

TaskResponse.prototype.isExecutionError = function(){
  return this.params.error;
};

module.exports.TaskResponse = TaskResponse;
