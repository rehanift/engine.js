var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Client", function(){
    var client;
    beforeEach(function(){
	this.task_klass = mock.task;
	this.task_identity_generator = new mock.task_identity_generator();
	client = engine.client.make({
	    sending_socket: new mock.socket(),
	    listening_socket: new mock.socket(),
	    task_klass: this.task_klass,
	    task_identity_generator: this.task_identity_generator
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
	it("generates a new identity for the new task",function(){
	    spyOn(this.task_identity_generator,'generate');
	    client.createTask();
	    expect(this.task_identity_generator.generate).toHaveBeenCalled();
	});

	it("creates a new task", function(){
	    var id = Math.floor(Math.random() * 100);
	    spyOn(this.task_identity_generator,'generate').andReturn(id);
	    spyOn(this.task_klass,'make');
	    client.createTask();
	    expect(this.task_klass.make).toHaveBeenCalledWith({id: id});
	});
	
        it("subscribes to the newly created task's id on the listening socket", function(){
	    var id = Math.floor(Math.random() * 100);
	    spyOn(this.task_identity_generator,'generate').andReturn(id);
	    spyOn(client.listening_socket,'subscribe');
	    client.createTask();
	    expect(client.listening_socket.subscribe).toHaveBeenCalledWith(id);
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

	it("unsubscribes the listening socket when a task has been evaluated", function(){
	    var mock_task = new mock.task();	    
	    spyOn(client,'find_task_by_id').andReturn(mock_task);
	    spyOn(client.listening_socket,'unsubscribe');
	    client.listening_socket.fakeSend(mock_task.id+' {"task_id":"'+mock_task.id+'", "last_eval":"foo bar"}');
	    expect(client.listening_socket.unsubscribe).toHaveBeenCalledWith(mock_task.id);
	});

    });

});