var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Client", function(){
    var client = engine.client.make({
        id: "1",
        sending_socket: new mock.socket(),
        listening_endpoint: "foo"
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
	it("creates a new engine.task object",function(){
	    var task = client.createTask();
	    expect(task instanceof engine.task).toBeTruthy();
	});

	it("created engine.task object holds reference to originating client",function(){
	    var task = client.createTask();
	    expect(task.client).toBe(client);
	});
    });
});