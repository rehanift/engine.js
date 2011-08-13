var engine = require("../robust").engine;

var mock = {};
mock.crankshaft = function(endpoint){
    var context = require("zeromq");
    var mockCrankshaft = context.createSocket("push");
    mockCrankshaft.connect(endpoint);

    return mockCrankshaft;
};

mock.cylinder_block = function(endpoint){
    var context = require("zeromq");
    var mockCylinderBlock = context.createSocket("pull");
    mockCylinderBlock.connect(endpoint);

    return mockCylinderBlock;
};

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
        client1.on("ready", callback1);
        client2.on("ready", callback2);
        
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
    
    describe("event:'crankshaft results'", function(){        
        it("throws an error when no running task is found", function(){ pending(); });

        it("receives task results", function(){            
            var client = new engine.client({
                crankshaft: "ipc://spec.ipc"
            });
            var mockCrankshaft = mock.crankshaft("ipc://spec.ipc");

            var callback = jasmine.createSpy();                   
            
            client.on("crankshaft ready", function(){     
                mockCrankshaft.send(JSON.stringify({foo:"bar"}));
            });

            client.on("crankshaft results", callback);
            
            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(callback).toHaveBeenCalled();
                client.close();
                mockCrankshaft.close();
            });            
        });

        it("calls a task's callback when its results are received", function(){
            pending();
            var client = new engine.client({
                crankshaft: "ipc://mock_crankshaft.ipc",
                cylinder_block: "ipc://mock_cylinderblock.ipc"
            });

            var mockCrankshaft = mock.crankshaft("ipc://mock_crankshaft.ipc");
            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");

            mockCylinderBlock.on("message", function(data){
                var running_task_id = JSON.parse(data.toString()).running_task_id;
                mockCrankshaft.send(JSON.stringify({running_task_id: running_task_id}));
            });

            var myTask;
            var myCallback = jasmine.createSpy();
            client.on("ready", function(){
                myTask = client.createTask();
                myTask.setCallback(myCallback);
                myTask.run();
            });

            client.on("crankshaft results", function(data){
                var parsed_data = JSON.parse(data.toString());
                
                expect(myCallback).toHaveBeenCalled();

                client.close();
                mockCrankshaft.close();
                mockCylinderBlock.close();            
            });

        });
    });

        
    it("emits a task's 'complete' event when its results are received", function(){ pending(); });
    it("emits a 'ready' event when all cylinders and pistons are ready to accept tasks", function(){ pending(); });
    

    describe("#run", function(){
        it("sends tasks to its configured cylinder block", function(){
            var client = new engine.client({
                cylinder_block: "ipc://mock_cylinderblock.ipc"
            });
            var callback = jasmine.createSpy();

            var mockCylinderBlock = mock.cylinder_block("ipc://mock_cylinderblock.ipc");  
            mockCylinderBlock.on("message",callback);
            
            client.on("ready", function(){
                client.run();
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
                var running_task_id = JSON.parse(data.toString()).running_task_id;
                mockCrankshaft.send(JSON.stringify({running_task_id: running_task_id}));
            });

            var myTask;
            client.on("ready", function(){
                myTask = client.createTask();
                myTask.run();
            });

            client.on("crankshaft results", function(data){
                var parsed_data = JSON.parse(data.toString());
                expect(parsed_data.running_task_id).toBeTruthy();
                expect(client.getRunningTask(parsed_data.running_task_id)).toBeTruthy();
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
            client.on("ready", callback);

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(task).toBeTruthy();
                expect(task instanceof engine.task).toBe(true);
                client.close();
            });            
        });

        it("stores a reference to the client within the new task", function(){
            var client = new engine.client();
            var task = client.createTask();

            var callback = jasmine.createSpy();            
            client.on("ready", callback);

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
            client.on("ready", callback);

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                client.close();
                expect(client.cylinder_block._zmq.state).toBe(2);
            });
        });
    });

});