var util = require("util");
var events = require("events");

var ZmqInboundCylinderConnection = function(zmq_socket){
  this.zmq_socket = zmq_socket;
};
util.inherits(ZmqInboundCylinderConnection, events.EventEmitter);

ZmqInboundCylinderConnection.prototype.close = function(){
  this.zmq_socket.close();
};

ZmqInboundCylinderConnection.create = function(config){
  var context = require("zmq");
  var socket = context.socket("pull");
  socket.connect(config.zmq_endpoint);
  var connection = new ZmqInboundCylinderConnection(socket);

  connection.zmq_socket.on("message", function(data){
    connection.emit("message", data.toString());
  });

  return connection;
};

module.exports = ZmqInboundCylinderConnection;