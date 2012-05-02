var util = require('util');

var TaskResponse = function(params) {
  this.params = params;
}

TaskResponse.prototype.getEvaluation = function(){
  return this.params.evaluation;
}

TaskResponse.prototype.getGlobals = function(){
  return this.params.globals;
}

TaskResponse.prototype.toString = function(){
  return "[TaskResponse result: " + util.inspect(this.params) + "]";
}

TaskResponse.prototype.isError = function(){
  return this.params.error;
}

module.exports.TaskResponse = TaskResponse;
