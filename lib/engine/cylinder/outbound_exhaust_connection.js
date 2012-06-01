var OutboundExhaustConnection = function(zmq_socket){
  this.zmq_socket = zmq_socket;
};

OutboundExhaustConnection.make = function(config){
  var connection = new OutboundExhaustConnection(config.zmq_socket);
  return connection;
};

OutboundExhaustConnection.create = function(options){
  var context = require("zmq");
  var socket = context.socket("push");
  socket.connect(options.exhaust_endpoint);

  var connection = OutboundExhaustConnection.make({
    zmq_socket: socket
  });

  return connection;
};

OutboundExhaustConnection.prototype.send_response = function(response){
  this.zmq_socket.send(response);
};

OutboundExhaustConnection.prototype.close = function(){
  this.zmq_socket.close();
};

module.exports = OutboundExhaustConnection;