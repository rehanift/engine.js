var engine = require("../../engine").engine;

describe("basic operations", function(){
    var client, task, intake, exhaust, cylinder;

    beforeEach(function(){
        intake = engine.intake.create();
        exhaust = engine.exhaust.create();
        cylinder = engine.cylinder.create();
        client = engine.client.create();
        task = client.createTask();        
    });

    afterEach(function(){
        intake.close();
        exhaust.close();
        cylinder.close();
        client.close();
        task.done();
    });

    it("evaluates user code", function(){
        var callback = jasmine.createSpy();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,1)");        
        task.run();
        task.on('eval', callback);
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe(2);
        });
        
    });

    it("outputs console messages", function(){
        var callback = jasmine.createSpy();
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
        });
        
    });
});
