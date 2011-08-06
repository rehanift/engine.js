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
    describe("#fire", function(){
	var myPiston;
	
	beforeEach(function(){
	    myPiston = new engine.piston();    
	});

	afterEach(function(){
	    // We need to close all the sockets or the spec won't exit when finished
	    myPiston.getSockets().forEach(function(socket){
		socket.close();
	    });
	});

	// This is the happy case
	it("evaluates user-code against a given context", function(){    
	    var response = myPiston.fire(JSON.stringify(SIMPLE_PAYLOAD));
	    expect(response['returned_data']).toEqual(2);
	});

	// These are the unhappy-cases
	it("throws a SyntaxError when the user-code has syntatically bad code", function(){
	    var response = myPiston.fire(JSON.stringify(BAD_SYNTAX_PAYLOAD));
	    expect(response['returned_data']).toContain("SyntaxError");
	});

	it("throws a ReferenceError when the user-code calls a function that is not defined in the Context", function(){
	    var response = myPiston.fire(JSON.stringify(BAD_CONTEXT_PAYLOAD));
	    expect(response['returned_data']).toContain("ReferenceError");
	});
    });
    
});