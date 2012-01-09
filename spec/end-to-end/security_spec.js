var engine = require("../../engine").engine;
var client, task, intake, exhaust, cylinder, logging_gateway;

intake = engine.intake.create();
exhaust = engine.exhaust.create();
cylinder = engine.cylinder.create({
    threshold: 1000,
    piston_script: "./script/piston.js"
});
client = engine.client.create();

describe("Sandbox Security", function(){

    describe("Function constructor attack",function(){
	it("throws a SecurityError when trying to call an explicit context function's constructor", function(){
            var callback = jasmine.createSpy();
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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
            task = client.createTask();
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

    // This test must always run last
    it("closes all components",function(){
        exhaust.close();
        cylinder.close();
        intake.close();
        client.close();

        waits(100);
    });

});