var CylinderTaskResponseSender = require("../../../lib/engine/piston/cylinder_task_response_sender");
var mock = require("../../spec_helper").mock;

describe("CylinderTaskResponseSender", function(){
  beforeEach(function(){
    this.outbound_cylinder_connection = new mock.OutboundCylinderConnection();
    this.task_response_serializer = new mock.TaskResponseSerializer();
    
    this.task_response_sender = CylinderTaskResponseSender.make({
      outbound_cylinder_connection: this.outbound_cylinder_connection,
      task_response_serializer: this.task_response_serializer
    });
  });

  it("serializes the TaskResponse", function(){
    spyOn(this.task_response_serializer,'serialize');
    var fake_response = new Object();
    this.task_response_sender.send_response(fake_response);
    expect(this.task_response_serializer.serialize).toHaveBeenCalledWith(fake_response);
  });

  it("sends the serialized TaskResponse to the outbound Cylinder connection", function(){
    spyOn(this.outbound_cylinder_connection,"send_response");
    var fake_serialized_response = new Object();
    spyOn(this.task_response_serializer,'serialize').andReturn(fake_serialized_response);
    
    var fake_response = new Object();
    this.task_response_sender.send_response(fake_response);

    expect(this.outbound_cylinder_connection.send_response).toHaveBeenCalledWith(fake_serialized_response);
  });
});