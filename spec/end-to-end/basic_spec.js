var engine = require("../../engine").engine;

describe("basic operations", function(){
    var client, task, intake, exhaust, cylinder;
    
    intake = engine.intake.create();
    exhaust = engine.exhaust.create();
    cylinder = engine.cylinder.create();
    client = engine.client.create();

    it("evaluates user code", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,0)");        
        task.run();
        task.on('eval', callback);
        
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
        task.setCode("add(3,4)");        
        task.run();
        task.on('eval', callback);
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe(7);
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

    /*
     * TODO
     *   - Two tasks, two cylinders: both cylinder should get hit
     *   - Two tasks, one cylinder: Timeout the first task, second task should process
     *   - Two tasks, two cylindres: both publishing to console
     */

    // This test must always run last
    it("closes all components",function(){
        exhaust.close();
        cylinder.close();
        intake.close();
        client.close();        
    });

});
