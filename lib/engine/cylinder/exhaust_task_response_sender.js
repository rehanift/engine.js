var TaskResponse = require("../client/task/response").TaskResponse;

var ExhaustTaskResponseSender = function(task_response_serializer, outbound_exhaust_connection){
  this.task_response_serializer = task_response_serializer;
  this.outbound_exhaust_connection = outbound_exhaust_connection;
};

ExhaustTaskResponseSender.make = function(config){
  var response_sender = new ExhaustTaskResponseSender(config.task_response_serializer,
                                               config.outbound_exhaust_connection);
  return response_sender;
};

ExhaustTaskResponseSender.create = function(options){
  var task_serializer = require("./task_response_serializer").create(),
      outbound_exhaust_connection = require("./outbound_exhaust_connection")
        .create({exhaust_endpoint: options.exhaust_endpoint});

  var response_sender = ExhaustTaskResponseSender.make({
    task_response_serializer: task_serializer,
    outbound_exhaust_connection: outbound_exhaust_connection
  });

  return response_sender;
};

ExhaustTaskResponseSender.prototype.build_response_object = function(params){
  var response = new TaskResponse(params);
  return response;
};

ExhaustTaskResponseSender.prototype.send_execution_error = function(task_id, error_message){
  var response = this.build_response_object({task_id: task_id, error: error_message});
  var serialized_response = this.task_response_serializer.serialize(response);
  this.outbound_exhaust_connection.send_response(serialized_response);
};

ExhaustTaskResponseSender.prototype.close = function(){
  this.outbound_exhaust_connection.close();
};

module.exports = ExhaustTaskResponseSender;