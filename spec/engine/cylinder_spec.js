var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Cylinder", function(){    
  var cylinder;

  beforeEach(function(){
    this.piston_manager = new mock.PistonProcessManager();
    this.execution_watcher = new mock.execution_watcher();
    this.logging_gateway = new mock.logging_gateway();
    this.task_response_sender = new mock.TaskResponseSender();

    cylinder = engine.cylinder.make({
      id: "1",
      listening_socket: new mock.socket(),
      sending_socket: new mock.socket(),
      results_socket: new mock.socket(),
      exhaust_socket: new mock.socket(),
      execution_watcher: this.execution_watcher,
      piston_process_manager: this.piston_manager,
      logging_gateway: this.logging_gateway,
      context_validator: new mock.context_validator(),
      task_response_sender: this.task_response_sender
    });
  });

  describe("context validation", function(){
    var task_with_bad_context = {
      task_id: "1",
      context: "foo",
      code: "",
      locals: {}
    };

    it("validates the recieved task's context", function(){
      spyOn(cylinder.context_validator,'validate');
      cylinder.listening_socket.fakeSend(JSON.stringify(task_with_bad_context));
      expect(cylinder.context_validator.validate).toHaveBeenCalledWith(task_with_bad_context.context, task_with_bad_context.locals);
    });

    it("when the context is valid task execution continues", function(){
      var task = JSON.stringify(task_with_bad_context);
      spyOn(cylinder.context_validator,'validate').andReturn(true);
      spyOn(cylinder,'send_next_task_or_queue');
      cylinder.listening_socket.fakeSend(task);
      expect(cylinder.send_next_task_or_queue).toHaveBeenCalledWith(task);
    });

    it("when the context is NOT valid task execution is halted", function(){
      var task = JSON.stringify(task_with_bad_context);
      spyOn(cylinder.context_validator,'validate').andReturn(false);
      spyOn(cylinder.exhaust_socket,'send');
      spyOn(cylinder,'send_next_task_or_queue');
      cylinder.listening_socket.fakeSend(task);
      expect(cylinder.send_next_task_or_queue).not.toHaveBeenCalledWith(task);
    });

    it("when the context is NOT valid an error message is returned", function(){
      var task = JSON.stringify(task_with_bad_context);
      spyOn(cylinder.context_validator,'validate').andReturn(false);
      spyOn(cylinder.exhaust_socket,'send');
      spyOn(cylinder,'send_next_task_or_queue');
      cylinder.listening_socket.fakeSend(task);
      expect(cylinder.exhaust_socket.send).toHaveBeenCalled();
    });
  });
  
  it("when a cylinder receives a task it sends it to the piston", function(){
    spyOn(cylinder.sending_socket,'send');
    cylinder.listening_socket.fakeSend(mock.TASK_PAYLOAD);
    expect(cylinder.sending_socket.send).toHaveBeenCalled();
  });

  describe("when a piston receives a task", function(){
    it("the watcher is started", function(){
      spyOn(cylinder.execution_watcher,'start');
      cylinder.listening_socket.fakeSend(mock.TASK_PAYLOAD);
      expect(cylinder.execution_watcher.start).toHaveBeenCalled();
    });        
  });

  it("when a piston finishes executing a task the cylinder clears the watcher", function(){
    spyOn(cylinder.execution_watcher,'clear');
    cylinder.results_socket.fakeSend(mock.TASK_RESULTS);
    expect(cylinder.execution_watcher.clear).toHaveBeenCalled();
  });

  it("when a piston finishes executing a task the cylinder sends the results to the exhaust publisher", function(){
    spyOn(cylinder.exhaust_socket,'send');
    cylinder.results_socket.fakeSend(mock.TASK_RESULTS);
    expect(cylinder.exhaust_socket.send).toHaveBeenCalled();        
  });

  describe("when a piston has been executing for too long", function(){
    it("kills the piston", function(){
      spyOn(this.piston_manager,'kill_current_process');
      cylinder.current_task = mock.TASK_PAYLOAD;
      this.execution_watcher.emit("kill");
      expect(this.piston_manager.kill_current_process).toHaveBeenCalled();
    });
  });

  describe("when a piston process crashes", function(){
    beforeEach(function(){
      this.stub_task = JSON.stringify(mock.TASK_PAYLOAD);
      spyOn(cylinder,'get_current_task').andReturn(this.stub_task);      
    });

    it("gets the current task", function(){
      this.piston_manager.emit("piston crash", "foo_code", "bar_signal");
      expect(cylinder.get_current_task).toHaveBeenCalled();
    });

    it("clears the current task's execution watcher", function(){
      spyOn(this.execution_watcher,'clear');
      this.piston_manager.emit("piston crash", "foo_code", "bar_signal");
      expect(this.execution_watcher.clear).toHaveBeenCalled();
    });

    it("logs the crash", function(){
      spyOn(this.logging_gateway,'log');
      this.piston_manager.emit("piston crash", "foo_code", "bar_signal");
      expect(this.logging_gateway.log).toHaveBeenCalled();
    });

    it("sends the task response to the exhaust", function(){
      spyOn(this.task_response_sender,'send_execution_error');
      this.piston_manager.emit("piston crash", "foo_code", "bar_signal");
      expect(this.task_response_sender.send_execution_error).
        toHaveBeenCalledWith(this.stub_task.task_id, "UnexpectedError: An unexpected error occurred while executing your task.");
    });
    
    it("sends the next task to the Piston", function(){
      spyOn(cylinder,'send_next_task_or_clear');
      this.piston_manager.emit("piston crash", "foo_code", "bar_signal");
      expect(cylinder.send_next_task_or_clear).toHaveBeenCalled();
    });
    
  });
  
  describe("storing the current task", function(){
    it("sets and gets the current task", function(){
      cylinder.set_current_task(mock.TASK_PAYLOAD);
      expect(cylinder.get_current_task()).toBe(mock.TASK_PAYLOAD);
    });
  });

  it("#close closes all sockets", function(){
    spyOn(cylinder.listening_socket,'close');
    spyOn(cylinder.sending_socket,'close');
    spyOn(cylinder.results_socket,'close');
    spyOn(cylinder.exhaust_socket,'close');
    spyOn(this.piston_manager,'terminate_current_process');
    cylinder.close();
    expect(cylinder.listening_socket.close).toHaveBeenCalled();
    expect(cylinder.sending_socket.close).toHaveBeenCalled();
    expect(cylinder.results_socket.close).toHaveBeenCalled();
    expect(cylinder.exhaust_socket.close).toHaveBeenCalled();
    expect(this.piston_manager.terminate_current_process).toHaveBeenCalled();
  });

});