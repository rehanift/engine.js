var util = require('util'),
    events = require('events'),
    Outlet = require('../lib/Outlet.js').Outlet;

var engine = require('../robust').engine;

var SIMPLE_PAYLOAD = {
    context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
    locals: "",
    code: "add(1,1)"
};

var BAD_SYNTAX_PAYLOAD = {
    context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
    locals: "",
    code: "add(1,1"
};

var BAD_CONTEXT_PAYLOAD = {
    context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
    locals: "",
    code: "subtract(1,1)"
};

describe("Piston", function(){  
    describe("server", function(){
	it("is started by calling #start with a zeromq compatible endpoint", function(){
	    var callback = jasmine.createSpy();
	    
	    var myPiston = new engine.piston();
	    myPiston.server.start("ipc://spec.ipc", callback);
	    
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(myPiston.server.running()).toBe(true);		
		myPiston.server.stop();
	    });

	});

	it("is stopped by calling #stop", function(){
	    var callback = jasmine.createSpy();
	    
	    var myPiston = new engine.piston();
	    myPiston.server.start("ipc://spec.ipc", function(){
		myPiston.server.stop(callback);
	    });	    
	    
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(myPiston.server.running()).toBe(false);
	    });
	});	

	it("responds to zeromq requests made it's bound endpoint", function(){
	    var myPiston = new engine.piston();
	    var callback = jasmine.createSpy();
	    var context = require('zeromq');
	    var client = context.createSocket("req");
	    myPiston.server.start("ipc://spec.ipc", function(){
		// create a simple zeromq-based client and send request to server
		client.connect("ipc://spec.ipc");
		client.send(JSON.stringify(SIMPLE_PAYLOAD));
		client.on("message", callback);
	    });

	    // Not sure what the best way to test this is...
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback).toHaveBeenCalled();
		myPiston.server.stop();
		client.close();
	    });
	});

    });

    describe("#fire", function(){
	// This is the happy case
	it("evaluates user-code against a given context", function(){    
	    var response = engine.piston.fire(JSON.stringify(SIMPLE_PAYLOAD));
	    expect(response['returned_data']).toEqual(2);
	});

	// These are the unhappy-cases
	it("throws a SyntaxError when the user-code has syntatically bad code", function(){
	    var response = engine.piston.fire(JSON.stringify(BAD_SYNTAX_PAYLOAD));
	    expect(response['returned_data']).toContain("SyntaxError");
	});

	it("throws a ReferenceError when the user-code calls a function that is not defined in the Context", function(){
	    var response = engine.piston.fire(JSON.stringify(BAD_CONTEXT_PAYLOAD));
	    expect(response['returned_data']).toContain("ReferenceError");
	});
    });
    
});