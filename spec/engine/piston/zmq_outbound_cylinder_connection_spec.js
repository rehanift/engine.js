var ZmqOutboundCylinderConnection = require("../../../lib/engine/piston/zmq_outbound_cylinder_connection");

describe("ZmqOutboundCylinderConnection", function(){
  beforeEach(function(){
    var context = require("zmq");
    this.zmq_endpoint = "ipc:///tmp/zmq-outbound-cylinder-connection.ipc";

    this.cylinder_pull_socket = context.socket("pull");
    this.cylinder_pull_socket.bindSync(this.zmq_endpoint);
    
    this.connection = ZmqOutboundCylinderConnection.create({ zmq_endpoint: this.zmq_endpoint });
  });

  it("sends a message to the Cylinder", function(){
    var spy = jasmine.createSpy();
    this.cylinder_pull_socket.on("message", spy);
    
    runs(function(){
      this.connection.send_response("foo");
    });
    
    waitsFor(function(){
      return spy.callCount > 0;
    });

    runs(function(){
      var message = spy.mostRecentCall.args[0].toString();
      expect(message).toBe("foo");
      this.cylinder_pull_socket.close();
      this.connection.close();
    });
  });
});