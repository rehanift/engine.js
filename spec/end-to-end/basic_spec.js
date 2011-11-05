var engine = require("../../engine").engine;
var client, client2, task, intake, exhaust, cylinder, cylinder2, logging_gateway;

intake = engine.intake.create();
exhaust = engine.exhaust.create();
cylinder = engine.cylinder.create({
    threshold: 1000,
    piston_script: "./script/piston.js"
});
client = engine.client.create();

describe("basic operations", function(){

    it("evaluates user code", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,0)");        
        task.on('eval', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe(1);
            task.done();
        });
        
    });

    it("outputs console messages", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("console.log('foo')");        
        task.on('output', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe("'foo'");
            task.done();
        });        
    });

    it("evaluates two tasks", function(){
        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,1)");        
        task.run();
        task.on('eval', callback1);

        var task2 = client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(3,4)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toBe(2);
            task.done();
            expect(callback2.mostRecentCall.args[0]).toBe(7);
            task2.done();
        });
        
    });

    it("evaluates two tasks across two cylinders", function(){
        cylinder2 = engine.cylinder.create({
	    piston_script: "./script/piston.js"
	});

        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        spyOn(cylinder.sending_socket,'send').andCallThrough();
        spyOn(cylinder2.sending_socket,'send').andCallThrough();

        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,1)");        
        task.run();
        task.on('eval', callback1);

        var task2 = client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(3,4)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(cylinder.sending_socket.send).toHaveBeenCalled();
            expect(cylinder2.sending_socket.send).toHaveBeenCalled();
            expect(callback1.mostRecentCall.args[0]).toBe(2);
            expect(callback2.mostRecentCall.args[0]).toBe(7);
            task.done();
            task2.done();
            cylinder2.close();
        });
      
        // we need to make sure this cylinder closes completely before the next test starts, otherwise
        //   it will consume a task and never process it
        waits(100);
        
    });

    it("task tasks, two cylinders, both pushlishing to console", function(){
        cylinder2 = engine.cylinder.create({
	    piston_script: "./script/piston.js"
	});

        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("console.log(add(1,1))");        
        task.run();
        task.on('output', callback1);

        var task2 = client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("console.log(add(3,4))");        
        task2.run();
        task2.on('output', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toBe('2');
            expect(callback2.mostRecentCall.args[0]).toBe('7');
            task.done();
            task2.done();
            cylinder2.close();
        });
      
        // we need to make sure this cylinder closes completely before the next test starts, otherwise
        //   it will consume a task and never process it
        waits(100);
        
    });

    it("evaluates two tasks with one cylinder. First task timeouts.", function(){
        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = client.createTask();
        task.setContext("(function(locals){ return { sleep: function() { var now = new Date().getTime(); while(new Date().getTime() < now + 100000) { /* sleep */ } } } })");
        task.setLocals({});
        task.setCode("sleep()");        
        task.run();
        task.on('eval', callback1);

        var task2 = client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(4,5)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        },null, 100000);

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toContain("TimeoutError");
            task.done();
            expect(callback2.mostRecentCall.args[0]).toBe(9);
            task2.done();
        });
        
    });

    it("evaluates two tasks from two clients", function(){
	client2 = engine.client.create();

	var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,0)");        
        task.on('eval', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        var callback2 = jasmine.createSpy();
        var task2 = client2.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(2,2)");        
        task2.on('eval', callback2);
        task2.run();
        
        waitsFor(function(){
            return callback.callCount > 0 && callback2.callCount;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe(1);
            expect(callback2.mostRecentCall.args[0]).toBe(4);
            task.done();
            task2.done();
	    client2.close();
        });
        
    });



    // This test must always run last
    it("closes all components",function(){
        exhaust.close();
        cylinder.close();
        intake.close();
        client.close();        

        waits(100);
    });

});