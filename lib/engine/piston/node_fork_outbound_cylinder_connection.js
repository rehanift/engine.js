var NodeForkOutboundCylinderConnection = function(){};

NodeForkOutboundCylinderConnection.make = function(){
  var connection = new NodeForkOutboundCylinderConnection();
  return connection;
};

NodeForkOutboundCylinderConnection.create = function(){
  var connection = NodeForkOutboundCylinderConnection.make({});
  return connection;
};

NodeForkOutboundCylinderConnection.prototype.send_response = function(response){
  process.send(response);
};

module.exports = NodeForkOutboundCylinderConnection;