var util = require("util");
var events = require("events");

var NodeForkInboundCylinderConnection = function(){};
util.inherits(NodeForkInboundCylinderConnection, events.EventEmitter);

NodeForkInboundCylinderConnection.make = function(){
  var connection = new NodeForkInboundCylinderConnection();

  process.on("message", function(data){
    connection.emit("message", data);
  });

  return connection;
};

NodeForkInboundCylinderConnection.create = function(){
  var connection = NodeForkInboundCylinderConnection.make({});
  return connection;
};

module.exports = NodeForkInboundCylinderConnection;