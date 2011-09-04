var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Client", function(){
    var client = engine.client.make({
        id: "1",
        sending_socket: new mock.socket(),
        listening_endpoint: "foo",
        task_creation_strategy: function(){
            return new mock.task();
        }
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
            spyOn(client,'createTaskFromStrategy');
            var task = client.createTask();
            expect(client.createTaskFromStrategy).toHaveBeenCalled();
        });
    });
});