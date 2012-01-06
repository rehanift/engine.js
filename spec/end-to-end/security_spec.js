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

    // This test must always run last
    it("closes all components",function(){
        exhaust.close();
        cylinder.close();
        intake.close();
        client.close();

        waits(100);
    });

});