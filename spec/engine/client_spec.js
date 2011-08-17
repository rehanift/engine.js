var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Client", function(){
    it("has a unique ID", function(){
        var client1 = new engine.client({
          cylinder_block: "ipc://cb1.ipc",
          crankshaft: "ipc://cs1.ipc"
        });
        var client2 = new engine.client({
          cylinder_block: "ipc://cb2.ipc",
          crankshaft: "ipc://cs2.ipc"
        });
        
        var callback1 = jasmine.createSpy();            
        var callback2 = jasmine.createSpy();            
        client1.on("client sockets ready", callback1);
        client2.on("client sockets ready", callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });
        
        runs(function(){
            expect(client1.id).toBeTruthy();
            expect(client1.id).not.toEqual(client2.id);
            
            client1.close();
            client2.close();
        });        
    });

    describe("event:'ready'", function(){
	it("fires when a client's cylinders and crankshaft are connected", function(){
	    var callback = jasmine.createSpy();
	    var mockCylinderBlock = mock.cylinder_block("ipc://cylinder_block.ipc");
	    var mockCrankshaft = mock.crankshaft("ipc://crankshaft.ipc");

	    var client = new engine.client({
		cylinder_block:"ipc://cylinder_block.ipc",
		crankshaft:"ipc://crankshaft.ipc"
	    });

	    mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		}
	    });

	    client.on("ready", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback).toHaveBeenCalled();
		client.close();
		mockCylinderBlock.close();
		mockCrankshaft.close();
	    });
	});
    });
    

    describe("task results", function(){
	it("are received", function(){
	    var client = new engine.client({
		crankshaft: "ipc://mock_crankshaft.ipc",
		cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {	
		    var running_task_id = JSON.parse(data.toString()).running_task_id;
		    mockCrankshaft.send(JSON.stringify({running_task_id: running_task_id}));
		}
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
		myTask = client.createTask();
		myTask.setCallback(myCallback);
		myTask.run();
            });

	    var callback = jasmine.createSpy();
	    client.on("crankshaft results", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback).toHaveBeenCalled();
		client.close();
		mockCrankshaft.close();
		mockCylinderBlock.close();
	    });
	});
	it("contains a 'last expression evaluation'", function(){
	    var client = new engine.client({
		crankshaft: "ipc://mock_crankshaft.ipc",
		cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {	
		    var running_task_id = JSON.parse(data.toString()).running_task_id;
		    var results = {
			last_exp_eval:"foo",
			running_task_id: running_task_id
		    };
		    mockCrankshaft.send(JSON.stringify(results));
		}
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
		myTask = client.createTask();
		myTask.setCallback(myCallback);
		myTask.run();
            });

	    var callback = jasmine.createSpy();
	    client.on("crankshaft results", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		var results = callback.mostRecentCall.args[0];
		var parsed_results = JSON.parse(results);		
		expect(Object.keys(parsed_results)).toContain('last_exp_eval');

		client.close();
		mockCrankshaft.close();
		mockCylinderBlock.close();
	    });
	});
	it("contain a 'modified context object'", function(){
	    var client = new engine.client({
		crankshaft: "ipc://mock_crankshaft.ipc",
		cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {	
		    var running_task_id = JSON.parse(data.toString()).running_task_id;
		    var results = {
			modified_context:"foo",
			running_task_id: running_task_id
		    };
		    mockCrankshaft.send(JSON.stringify(results));
		}
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
		myTask = client.createTask();
		myTask.setCallback(myCallback);
		myTask.run();
            });

	    var callback = jasmine.createSpy();
	    client.on("crankshaft results", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		var results = callback.mostRecentCall.args[0];
		var parsed_results = JSON.parse(results);		
		expect(Object.keys(parsed_results)).toContain('modified_context');

		client.close();
		mockCrankshaft.close();
		mockCylinderBlock.close();
	    });
	});
    });
    
    describe("when a client's running task completes", function(){
	it("the callback for the original task is called", function(){
            var client = new engine.client({
		crankshaft: "ipc://mock_crankshaft.ipc",
		cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {	
		    var running_task_id = JSON.parse(data.toString()).running_task_id;
		    mockCrankshaft.send(JSON.stringify({running_task_id: running_task_id}));
		}
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
		myTask = client.createTask();
		myTask.setCallback(myCallback);
		myTask.run();
            });

	    waitsFor(function(){
		return myCallback.callCount > 0;
	    });

	    runs(function(){
		expect(myCallback).toHaveBeenCalled();
		client.close();
		mockCrankshaft.close();
		mockCylinderBlock.close();
	    });
	});

	it("an error is thrown when a Task reference cannot be found", function(){
            var client = new engine.client({
		crankshaft: "ipc://mock_crankshaft.ipc",
		cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {	
		    var running_task_id = JSON.parse(data.toString()).running_task_id;
		    mockCrankshaft.send(JSON.stringify({running_task_id: "foo"}));
		}
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
		myTask = client.createTask();
		myTask.setCallback(myCallback);
		myTask.run();
            });
	    
	    var callback = jasmine.createSpy();
	    client.crankshaft.on("error", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback.mostRecentCall.args[0]).toBe("Client could not find Task reference to completed running task");
		client.close();
		mockCrankshaft.close();
		mockCylinderBlock.close();
	    });
	});
    });

    
    describe("#run", function(){
        it("sends a task to the cylinder block", function(){
            var client = new engine.client({
                cylinder_block: "ipc://mock_cylinderblock.ipc"
            });
            var callback = jasmine.createSpy();

            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");  
            mockCylinderBlock.on("message",callback);
            
	    var mytask = client.createTask();

            client.on("ready", function(){
                client.run(mytask);
            });

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(callback).toHaveBeenCalled();
                client.close();
                mockCylinderBlock.close();
            });
        });

        it("stores a reference to a running task", function(){
            var client = new engine.client({
                crankshaft: "ipc://mock_crankshaft.ipc",
                cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
		if(data.toString() == engine.constants.HANDSHAKE) {
		    mockCrankshaft.send(engine.constants.READY);
		} else {		
                    var running_task_id = JSON.parse(data.toString()).running_task_id;
                    mockCrankshaft.send(JSON.stringify({running_task_id: running_task_id}));
		}
            });

            var myTask;
            client.on("ready", function(){
                myTask = client.createTask();
		myTask.setCallback(function(){});
                myTask.run();
            });

            client.on("crankshaft results", function(data){
                var parsed_data = JSON.parse(data.toString());
                expect(client.getRunningTask(parsed_data.running_task_id)).toBe(myTask);

                client.close();
                mockCrankshaft.close();
                mockCylinderBlock.close();
            });
            
        });

    });

    describe("#createTask", function(){
        it("creates a new Task", function(){
            var client = new engine.client();
            var task = client.createTask();

            var callback = jasmine.createSpy();            
            client.on("client sockets ready", callback);

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(task instanceof engine.task).toBe(true);
                client.close();
            });            
        });

        it("creates a new Task that stores a reference back to the client", function(){
            var client = new engine.client();
            var task = client.createTask();

            var callback = jasmine.createSpy();            
            client.on("client sockets ready", callback);

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(task.client).toBe(client);
                client.close();
            });
        });
    });

    describe("#close", function(){
        it("closes all zeromq sockets", function(){
            var callback = jasmine.createSpy();
            var client = new engine.client();            
            client.on("client sockets ready", callback);

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                client.close();
                expect(client.cylinder_block._zmq.state).toBe(2);
                expect(client.crankshaft._zmq.state).toBe(2);
            });
        });
    });

});