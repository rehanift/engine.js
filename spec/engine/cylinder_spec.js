var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Cylinder", function(){    
    var cylinder;

    beforeEach(function(){
      this.piston_manager = new mock.PistonProcessManager();
      this.execution_watcher = new mock.execution_watcher();

        cylinder = engine.cylinder.make({
	    id: "1",
	    listening_socket: new mock.socket(),
	    sending_socket: new mock.socket(),
	    results_socket: new mock.socket(),
            exhaust_socket: new mock.socket(),
	    execution_watcher: this.execution_watcher,
            piston_process_manager: this.piston_manager,
	    logging_gateway: new mock.logging_gateway(),
	    context_validator: new mock.context_validator()
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