var engine = require("../robust").engine;

describe("Client", function(){
    it("has a unique ID", function(){
        var client1 = new engine.client();
        var client2 = new engine.client();
        
        var callback1 = jasmine.createSpy();            
        client1.on("cylinder block ready", callback1);
        var callback2 = jasmine.createSpy();            
        client2.on("cylinder block ready", callback2);
        
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

    it("receives task results from its configured crankshaft", function(){
        var client = new engine.client({
            crankshaft: "ipc://spec.ipc"
        });
        var callback = jasmine.createSpy();       
        var context = require("zeromq");
        var mockCrankshaft = context.createSocket("push");
        mockCrankshaft.connect("ipc://spec.ipc");
        
        client.on("crankshaft ready", function(){     
            mockCrankshaft.send("foo");
        });

        client.on("crankshaft results", callback);

        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0].toString()).toBe("foo");
            client.close();
            mockCrankshaft.close();
        });
        
    });
    
    it("calls a task's callback when its results are received", function(){ pending(); });
    it("emits a task's 'complete' event when its results are received", function(){ pending(); });
    it("emits a 'ready' event when all cylinders and pistons are ready to accept tasks", function(){ pending(); });
    

    describe("#run", function(){
        it("sends tasks to its configured cylinder block", function(){
            var client = new engine.client({
                cylinder_block: "ipc://spec.ipc"
            });
            var callback = jasmine.createSpy();

            var context = require("zeromq");
            var mockCylinderBlock = context.createSocket("pull");
            mockCylinderBlock.connect("ipc://spec.ipc");           
            mockCylinderBlock.on("message",callback);
            
            client.on("cylinder block ready", function(){
                client.run("foo");
            });

            waitsFor(function(){
                return callback.callCount > 0;
            });

            runs(function(){
                expect(callback.mostRecentCall.args[0].toString()).toBe("foo");
                client.close();
                mockCylinderBlock.close();
            });
        });
    });

    describe("#createTask", function(){
        it("creates a new Task", function(){
            var client = new engine.client();
            var task = client.createTask();

            var callback = jasmine.createSpy();            
            client.on("cylinder block ready", callback);

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
            client.on("cylinder block ready", callback);

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
            client.on("cylinder block ready", callback);

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