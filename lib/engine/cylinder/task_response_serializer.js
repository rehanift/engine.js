var TaskResponseSerializer = function(){};

TaskResponseSerializer.make = function(){
  var response_serializer = new TaskResponseSerializer();
  return response_serializer;
};

TaskResponseSerializer.create = function(){
  var response_serializer = TaskResponseSerializer.make({});
  return response_serializer;
};

TaskResponseSerializer.prototype.serialize = function(task){
  return JSON.stringify(task.params);
};

module.exports = TaskResponseSerializer;