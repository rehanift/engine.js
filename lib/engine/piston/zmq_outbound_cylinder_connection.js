var ZmqOutboundCylinderConnection = function(zmq_socket){
  this.zmq_socket = zmq_socket;
};

ZmqOutboundCylinderConnection.create = function(config){
  var context = require("zmq");
  var socket = context.socket("push");
  socket.connect(config.zmq_endpoint);
  var connection = new ZmqOutboundCylinderConnection(socket);

  return connection;
};

ZmqOutboundCylinderConnection.prototype.send_response = function(response){
  this.zmq_socket.send(response);
};

ZmqOutboundCylinderConnection.prototype.close = function(){
  this.zmq_socket.close();
};


module.exports = ZmqOutboundCylinderConnection;