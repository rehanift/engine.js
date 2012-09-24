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
  var json_safe = require("../../jsonify");
  return json_safe.stringify(task.params);
};

module.exports = TaskResponseSerializer;