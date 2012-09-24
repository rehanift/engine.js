var CylinderTaskResponseSender = function(task_response_serializer, outbound_cylinder_connection){
  this.task_response_serializer = task_response_serializer;
  this.outbound_cylinder_connection = outbound_cylinder_connection;
};

CylinderTaskResponseSender.make = function(config){
  var task_response_sender = new CylinderTaskResponseSender(config.task_response_serializer,
                                                            config.outbound_cylinder_connection);
  return task_response_sender;
};

CylinderTaskResponseSender.create = function(options){
  var serializer = require("../cylinder/task_response_serializer").create();

  var connection = require("./zmq_outbound_cylinder_connection").create({
    zmq_endpoint: options.sending_endpoint
  });

  var task_response_sender = CylinderTaskResponseSender.make({
    task_response_serializer: serializer,
    outbound_cylinder_connection: connection
  });
  return task_response_sender;
};

CylinderTaskResponseSender.prototype.send_response = function(task_response){
  var serialized_response = this.task_response_serializer.serialize(task_response);
  this.outbound_cylinder_connection.send_response(serialized_response);
};

module.exports = CylinderTaskResponseSender;