var ExhaustTaskResponseSender = require("../../../lib/engine/cylinder/exhaust_task_response_sender"),
    TaskResponse = require("../../../lib/engine/client/task/response").TaskResponse,
    mock = require("../../spec_helper").mock;

describe("ExhaustTaskResponseSender", function(){
  beforeEach(function(){
    this.task_response_serializer = new mock.TaskResponseSerializer();
    this.outbound_exhaust_connection = new mock.OutboundExhaustConnection();
    
    this.response_sender = ExhaustTaskResponseSender.make({
      task_response_serializer: this.task_response_serializer,
      outbound_exhaust_connection: this.outbound_exhaust_connection
    });
  });
  
  it("builds a TaskResponse object", function(){
    var response = this.response_sender.build_response_object({task_id: 2, error: "FooError"});
    expect(response instanceof TaskResponse).toBeTruthy();
  });

  describe("sending an execution error", function(){
    it("creates a TaskResponse object", function(){
      spyOn(this.response_sender,'build_response_object');
      this.response_sender.send_execution_error(2, "FooError");
      expect(this.response_sender.build_response_object).
        toHaveBeenCalledWith({task_id: 2, error: "FooError"});
    });

    it("serializes the TaskResponse", function(){
      var stub_response = new TaskResponse({task_id: 2, error: "FooError"});
      spyOn(this.response_sender,'build_response_object').andReturn(stub_response);
      spyOn(this.task_response_serializer,'serialize');
      this.response_sender.send_execution_error(2, "FooError");
      expect(this.task_response_serializer.serialize).toHaveBeenCalledWith(stub_response);
    });

    it("sends the serialized task to the outbound exhaust socket", function(){
      var stub_response = new TaskResponse({task_id: 2, error: "FooError"});
      spyOn(this.response_sender,'build_response_object').andReturn(stub_response);
      var stub_serialized_response = {foo:"bar"};
      spyOn(this.task_response_serializer,'serialize').andReturn(stub_serialized_response);
      spyOn(this.outbound_exhaust_connection,'send_response');
      this.response_sender.send_execution_error(2, "FooError");
      expect(this.outbound_exhaust_connection.send_response).toHaveBeenCalledWith(stub_serialized_response);      
    });
  });
});