var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Client", function(){
    var client;
    beforeEach(function(){
	client = engine.client.make({
	    id:"1",
	    sending_socket: new mock.socket(),
	    listening_socket: new mock.socket(),
	    task_creation_strategy: function(){
		return new mock.task()
	    }
	});
    });

    
    it("#close closes the intake manifold socket",function(){
	spyOn(client.sending_socket,'close');
	client.close();	
	expect(client.sending_socket.close).toHaveBeenCalled();
    });

    it("#run sends a task to the intake manifold",function(){
	spyOn(client.sending_socket, "send");
	var task = new mock.task();
	client.run(task);
	expect(client.sending_socket.send).toHaveBeenCalled();
    });

    describe("#createTask", function(){
        it("uses the client's task creator strategy", function(){
	    var mock_task = new mock.task();
            spyOn(client,'createTaskFromStrategy').andReturn(mock_task);
            var task = client.createTask();
            expect(client.createTaskFromStrategy).toHaveBeenCalled();
        });

        it("subscribes to the newly created task's id on the listening socket", function(){
	    spyOn(client.listening_socket,'subscribe');
	    var task = client.createTask();
	    expect(client.listening_socket.subscribe).toHaveBeenCalledWith(task.id);
        });
    });

    describe("when results arrive for a task", function(){

	it("looks up the task by its ID", function(){	
	    var mock_task = new mock.task();
	    spyOn(client,'find_task_by_id').andReturn(mock_task);
	    client.listening_socket.fakeSend('task-123 {"task_id":"task-123", "last_eval":"hello world"}');
	    expect(client.find_task_by_id).toHaveBeenCalledWith('task-123');
	});

	it("emits an 'output' event for the task", function(){	
	    var mock_task = new mock.task();	    
	    spyOn(client,'find_task_by_id').andReturn(mock_task);
	    spyOn(mock_task,'emit');
	    client.listening_socket.fakeSend('task-123 {"task_id":"task-123", "console":"hello world"}');
	    expect(mock_task.emit).toHaveBeenCalledWith("output","hello world");
	});

	it("emits an 'eval' event for the task", function(){
	    var mock_task = new mock.task();	    
	    spyOn(client,'find_task_by_id').andReturn(mock_task);
	    spyOn(mock_task,'emit');
	    client.listening_socket.fakeSend('task-123 {"task_id":"task-123", "last_eval":"foo bar"}');
	    expect(mock_task.emit).toHaveBeenCalledWith("eval","foo bar");
	});

    });

});