var CylinderTaskResponseSender = function(task_response_serializer, outbound_cylinder_connection){
  this.task_response_serializer = task_response_serializer;
  this.outbound_cylinder_connection = outbound_cylinder_connection;
};

CylinderTaskResponseSender.make = function(config){
  var task_response_sender = new CylinderTaskResponseSender(config.task_response_serializer,
                                                            config.outbound_cylinder_connection);
  return task_response_sender;
};

CylinderTaskResponseSender.create = function(){
  var task_response_sender = CylinderTaskResponseSender.make({});
  return task_response_sender;
};

CylinderTaskResponseSender.prototype.send_response = function(task_response){
  var serialized_response = this.task_response_serializer.serialize(task_response);
  this.outbound_cylinder_connection.send_response(serialized_response);
};

module.exports = CylinderTaskResponseSender;