var engine = require("../../engine").engine;
var factories = require("../spec_helper").component_factories;
var task;

describe("Sandbox Security", function(){

    beforeEach(function(){
	waits(500);

	runs(function(){

	    this.identifier = "security" + Math.floor(Math.random() * 100000);

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

    describe("Function#toString attach", function(){
	it("throws a SecurityError when trying to call '.toString' on a context function", function(){
            var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return { foo: function(){ return 'bar' } } })");
            task.setLocals({});
            task.setCode("foo.toString()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });

	});
    });

    describe("Function constructor attack",function(){
	it("throws a SecurityError when trying to call an explicit context function's constructor", function(){
            var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return { foo: function(){ } } })");
            task.setLocals({});
            task.setCode("foo.constructor('return process')()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });

	});

	it("throws a SecurityError when trying to call an implicit context function's constructor", function(){
            var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("console.log.constructor('return process')()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });

	});
    });

    describe("Function caller attack", function(){
	it("throws a TypeError when trying to walk the 'caller chain' from a locally defined & invoked function out of the sandbox", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("(function foo() { console.log( foo.caller.caller.toString());})()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("TypeError");
            });
	});

	it("throws a TypeError when trying to walk the 'argument caller chain' from a locally defined & invoked function out of the sandbox", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("(function foo() {return [].slice.call(foo.caller.arguments);})()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("TypeError");
            });
	});
    });

    describe("user-defined hook attacks", function(){
	it("'toJSON' methods cannot walk outside the sandbox", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("(function foo() {return {toJSON:function x(){ return x.caller.name}}})()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });
	});

	it("'toJSON' methods cannot walk outside the sandbox (nested)", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("(function foo() {return {foo:'bar', test: {toJSON:function x(){ return x.caller.name}}}})()");
            task.on('eval', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(JSON.stringify(callback.mostRecentCall.args[0])).toContain("SecurityError");
            });
	});


	it("'inspect' method cannot walk outside the sandbox", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("console.log({inspect: function x(){ return x.caller.caller.name } })");
            task.on('output', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });
	});

	it("'inspect' method cannot walk outside the sandbox (nested)", function(){
	    var callback = jasmine.createSpy();
            task = this.client.createTask();
            task.setContext("(function(locals){ return {  } })");
            task.setLocals({});
            task.setCode("console.log({foo: 'bar', test: {inspect: function x(){ return x.caller.caller.name } }})");
            task.on('output', callback);
            task.run();
            
            waitsFor(function(){
		return callback.callCount > 0;
            });

            runs(function(){
		expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
            });
	});

    });

});