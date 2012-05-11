var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

var TaskResponse = require("../../lib/engine/client/task/response").TaskResponse;

describe("Client", function(){
    var client;
    beforeEach(function(){
	this.response_translator = new mock.TaskResponseTranslator();

	client = engine.client.make({
	    id:"1",
	    sending_socket: new mock.socket(),
	    listening_socket: new mock.socket(),
	    task_creation_strategy: function(){
		return new mock.task()
	    },
	    task_response_translator: this.response_translator
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


    describe("when output results arrive for a task", function(){
	it("emits an 'output' event for the task", function(){
	    this.response = 'task-123 {"task_id":"task-123", "console":"hello world"}';
            this.mock_task_response = new TaskResponse({
                task_id:"task-123",
                console:"hello world"
            });
	    spyOn(this.response_translator,'translate').andReturn(this.mock_task_response);
	    this.mock_task = new mock.task();
	    spyOn(client,'find_task_by_id').andReturn(this.mock_task);
            
	    spyOn(this.mock_task,'emit');
	    client.listening_socket.fakeSend(this.response);
	    expect(this.mock_task.emit).toHaveBeenCalledWith("output","hello world");
	});        
    });

    describe("where there is not output and no evaluation", function(){
        it("emits an 'eval' event for the task", function(){
	    this.response = 'task-123 {"task_id":"task-123", "evaluation":undefined}';
            this.mock_task_response = new TaskResponse({
                task_id:"task-123",
                evaluation:undefined
            });
	    spyOn(this.response_translator,'translate').andReturn(this.mock_task_response);
	    this.mock_task = new mock.task();
	    spyOn(client,'find_task_by_id').andReturn(this.mock_task);

            spyOn(this.mock_task,'emit');
            client.listening_socket.fakeSend(this.response);
            expect(this.mock_task.emit).toHaveBeenCalledWith("eval", null, this.mock_task_response);
        });
    });

    describe("when successful evaluation results arrive for a task", function(){
	beforeEach(function(){
	    this.response = 'task-123 {"task_id":"task-123", "evaluation":"hello world"}';
            this.mock_task_response = new TaskResponse({
                task_id:"task-123"
            });
	    spyOn(this.response_translator,'translate').andReturn(this.mock_task_response);
	    this.mock_task = new mock.task();
	    spyOn(client,'find_task_by_id').andReturn(this.mock_task);
	});

	it("translates the response into a TaskResponse object", function(){
	    client.listening_socket.fakeSend(this.response);
	    expect(this.response_translator.translate).toHaveBeenCalledWith(this.response);
	});

	it("looks up the task by its ID", function(){	
	    client.listening_socket.fakeSend(this.response);
	    expect(client.find_task_by_id).toHaveBeenCalledWith('task-123');
	});

	it("emits an 'eval' event for the task", function(){
	    spyOn(this.mock_task,'emit');
	    client.listening_socket.fakeSend(this.response);
	    expect(this.mock_task.emit).toHaveBeenCalledWith("eval", null, this.mock_task_response);
	});

        it("emits an 'end' event for the task after the linger_wait", function(){
            spyOn(this.mock_task,'emit');
            client.listening_socket.fakeSend(this.response);

            waitsFor(function(){
                return this.mock_task.emit.callCount > 1;
            });

            runs(function(){
                expect(this.mock_task.emit).toHaveBeenCalledWith("end");
            });
        });

	// pending until we abstract out the sockets
	xit("unsubscribes the listening socket when a task has been evaluated", function(){
	    spyOn(client.listening_socket,'unsubscribe');
	    client.listening_socket.fakeSend(this.mock_task.id+' {"task_id":"'+this.mock_task.id+'", "last_eval":"foo bar"}');
	    expect(client.listening_socket.unsubscribe).toHaveBeenCalledWith(this.mock_task.id);
	});

    });

});
