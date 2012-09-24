var ZmqInboundCylinderConnection = require("../../../lib/engine/piston/zmq_inbound_cylinder_connection");

describe("ZmqInboundCylinderConnection", function(){
  beforeEach(function(){
    var context = require("zmq");
    this.zmq_endpoint = "ipc:///tmp/zmq-inbound-cylinder-connection.ipc";

    this.cylinder_push_socket = context.socket("push");
    this.cylinder_push_socket.bindSync(this.zmq_endpoint);
    
    this.connection = ZmqInboundCylinderConnection.create({ zmq_endpoint: this.zmq_endpoint });
  });

  it("emits a 'message' event", function(){
    var spy = jasmine.createSpy();
    this.connection.on("message", spy);
    
    runs(function(){
      this.cylinder_push_socket.send("foo");
    });
    
    waitsFor(function(){
      return spy.callCount > 0;
    });

    runs(function(){
      expect(spy).toHaveBeenCalledWith("foo");
      this.cylinder_push_socket.close();
      this.connection.close();
    });
  });
});