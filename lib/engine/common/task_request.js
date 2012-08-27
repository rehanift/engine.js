var TaskRequest = function(params){
  this.task_id = params.task_id;
  this.context = params.context;
  this.locals = params.locals;
  this.code = params.code;
};

TaskRequest.prototype = {
  getTaskId: function(){ return this.task_id; },
  getContext: function(){ return this.context; },
  getLocals: function(){ return this.locals; },
  getCode: function(){ return this.code; }
};

module.exports = TaskRequest;