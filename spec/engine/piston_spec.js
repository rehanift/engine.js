var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Piston", function(){
  beforeEach(function(){
    this.task_receiver = new mock.PistonTaskReceiver();
    this.task_executor = new mock.TaskExecutor();
    this.task_response_sender = new mock.CylinderTaskResponseSender();

    this.piston = engine.piston.make({
      task_receiver: this.task_receiver,
      task_executor: this.task_executor,
      task_response_sender: this.task_response_sender
    });
  }); 

  it("receives tasks and executes them", function(){
    spyOn(this.task_executor,"execute_task");
    var fake_task = new Object();
    this.task_receiver.emit("task received", fake_task);
    expect(this.task_executor.execute_task).toHaveBeenCalledWith(fake_task);
  });

  it("sends task results back to the client", function(){
    spyOn(this.task_response_sender,"send_task_response");
    var fake_task_response = new Object();
    this.task_executor.emit("task executed", fake_task_response);
    expect(this.task_response_sender.send_task_response).toHaveBeenCalledWith(fake_task_response);
  });

  it("closes down the task receiver and task sender", function(){
    spyOn(this.task_receiver,"close");
    spyOn(this.task_response_sender,"close");
    this.piston.close();
    expect(this.task_receiver.close).toHaveBeenCalled();
    expect(this.task_response_sender.close).toHaveBeenCalled();
  });
});