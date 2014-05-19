var util = require("util");
var events = require("events");

var PistonTaskReceiver = function(inbound_cylinder_connection, task_request_translator){
  this.inbound_cylinder_connection = inbound_cylinder_connection;
  this.task_request_translator = task_request_translator;
};
util.inherits(PistonTaskReceiver,events.EventEmitter);

PistonTaskReceiver.make = function(config){  
  var receiver = new PistonTaskReceiver(config.inbound_cylinder_connection,
                                        config.task_request_translator);
  receiver.inbound_cylinder_connection.on("message", function(message){
    var task_request = receiver.task_request_translator.translate(message);
    receiver.emit("task received", task_request);
  });

  return receiver;
};

PistonTaskReceiver.create = function(options){
  var connection = require("./node_fork_cylinder_connection").create();

  var translator = require("../common/json_task_request_translator").create();

  var receiver = PistonTaskReceiver.make({
    inbound_cylinder_connection: connection,
    task_request_translator: translator
  });
  
  return receiver;
};

PistonTaskReceiver.prototype.close = function(){
  this.inbound_cylinder_connection.close();
};

module.exports = PistonTaskReceiver;