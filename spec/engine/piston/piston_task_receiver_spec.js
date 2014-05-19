var PistonTaskReceiver = require("../../../lib/engine/piston/piston_task_receiver");

var mock = require("../../spec_helper").mock;

describe("PistonTaskReceiver", function(){
  beforeEach(function(){
    this.connection = new mock.InboundCylinderConnection();
    this.translator = new mock.TaskRequestTranslator();
    
    this.receiver = PistonTaskReceiver.make({
      inbound_cylinder_connection: this.connection,
      task_request_translator: this.translator
    });
  });
  
  it("translates received messages into Tasks", function(){
    spyOn(this.translator,"translate");
    var fake_message = new Object();
    this.connection.emit("message", fake_message);
    expect(this.translator.translate).toHaveBeenCalledWith(fake_message);
  });

  it("emits a 'task received' with a TaskRequest object", function(){
    var fake_task = new Object();
    spyOn(this.receiver,"emit");
    spyOn(this.translator,"translate").andReturn(fake_task);
    this.connection.emit("message", null);
    expect(this.receiver.emit).toHaveBeenCalledWith("task received", fake_task);
  });

  it("closes the inbound cylinder connection", function(){
    spyOn(this.connection,"close");
    this.receiver.close();
    expect(this.connection.close).toHaveBeenCalled();
  });
});