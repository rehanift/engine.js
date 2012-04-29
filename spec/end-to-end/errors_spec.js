var engine = require("../../engine").engine;
var task;
var factories = require("../spec_helper").component_factories;

describe("error scenarios", function(){
    beforeEach(function(){
	waits(500);

	runs(function(){
	    this.identifier = "error" + Math.floor(Math.random() * 100000);

	    this.intake = factories.create_ipc_intake(this.identifier);
	    this.exhaust = factories.create_ipc_exhaust(this.identifier);
	    this.cylinder = (factories.create_ipc_cylinders(1,this.identifier))["1"];
	    this.client = (factories.create_ipc_clients(1,this.identifier))["1"];
	});
    });

    afterEach(function(){
	this.intake.close();
	this.exhaust.close();
	this.cylinder.close();
	this.client.close();
    });


    it("throws a TimeoutError", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { sleep: function() { var now = new Date().getTime(); while(new Date().getTime() < now + 10000) { /* sleep */ } } } })");
        task.setLocals({});
        task.setCode("sleep();");        
        task.on('eval', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toContain("TimeoutError");
        });
        
    });

    it("catches syntax errors with task's code", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,2");        
        task.on('eval', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toContain("SyntaxError");
        });
        
    });

    it("throws a ReferenceError", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("subtract(1,1)");        
        task.on('eval', callback);
        task.run();
        
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
            task = this.client.createTask();
            task.setContext("foo;");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});

	it("catches task context's that are not functions", function(){
            var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("({'foo':'bar'})");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});


	it("catches task context's that do not return object literals", function(){
            var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(){ return 1; })");
            task.setLocals({});
            task.setCode("subtract(1,1)");        
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SandboxError");
            });
            
	});

    });

});