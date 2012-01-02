var engine = require("../../engine").engine;
var client, task, intake, exhaust, cylinder;
    
intake = engine.intake.create();
exhaust = engine.exhaust.create();
cylinder = engine.cylinder.create({
    threshold: 1000,
    piston_script: "./script/piston.js"
});
client = engine.client.create();

describe("error scenarios", function(){
    it("throws a TimeoutError", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { sleep: function() { var now = new Date().getTime(); while(new Date().getTime() < now + 10000) { /* sleep */ } } } })");
        task.setLocals({});
        task.setCode("sleep();");        
        task.on('eval', callback);
        client.run(task);
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toContain("TimeoutError");
        });
        
    });

    it("catches syntax errors with task's code", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,2");        
        task.on('eval', callback);
        client.run(task);
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toContain("SyntaxError");
        });
        
    });

    it("throws a ReferenceError", function(){
        var callback = jasmine.createSpy();
        task = client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("subtract(1,1)");        
        task.on('eval', callback);
        client.run(task);
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toContain("ReferenceError");
        });
        
    });

    describe("Context Validation", function(){
	it("catches syntax errors in task's context", function(){
            var callback = jasmine.createSpy();
            task = client.createTask();
            task.setContext("foo;");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            client.run(task);
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});

	it("catches task context's that are not functions", function(){
            var callback = jasmine.createSpy();
            task = client.createTask();
            task.setContext("({'foo':'bar'})");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            client.run(task);
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});


	it("catches task context's that do not return object literals", function(){
            var callback = jasmine.createSpy();
            task = client.createTask();
            task.setContext("(function(){ return 1; })");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            client.run(task);
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});


    });


    // This test must always run last
    it("closes all components",function(){
        exhaust.close();
        cylinder.close();
        intake.close();
        client.close();        

        waits(1000);
    });

});