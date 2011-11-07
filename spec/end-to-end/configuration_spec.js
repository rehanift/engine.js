var engine = require("../../engine").engine;
var client, task, intake, exhaust, cylinder;

describe("configurations", function(){

    describe("custom zeromq endpoints", function(){
	
	beforeEach(function(){
	    client = engine.client.create({
		sending_endpoint: "tcp://127.0.0.1:5555",
		listening_endpoint: "tcp://127.0.0.1:5556"
	    });
	    intake = engine.intake.create({
		listening_endpoint: "tcp://127.0.0.1:5555",
		sending_endpoint: "tcp://127.0.0.1:5557"
	    });
	    cylinder = engine.cylinder.create({
		listening_endpoint: "tcp://127.0.0.1:5557",
		exhaust_endpoint: "tcp://127.0.0.1:5558",
		piston_script: "./script/piston.js"
	    });
	    exhaust = engine.exhaust.create({
		listening_endpoint: "tcp://127.0.0.1:5558",
		publishing_endpoint: "tcp://127.0.0.1:5556"
	    });
	});

	afterEach(function(){
            exhaust.close();
            cylinder.close();
            intake.close();
            client.close();        

            waits(100);
	});
	
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
            });        
	});

    });

});