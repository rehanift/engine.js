var util = require('util'),
    events = require('events');

var engine = require('../robust').engine;

var PISTON_ENDPOINT = "ipc://spec.ipc";
var SIMPLE_PAYLOAD = {
    context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
    locals: "",
    code: "add(1,1)"
};

var mockCylinder = function(){
    var context = require('zeromq');
    var self = this;

    self.request_socket = context.createSocket("req");
    self.request_socket.connect(PISTON_ENDPOINT);
    self.request_socket.on("message", function(data){
	self.response_count++;
	self.last_response = data.toString();
    });

    self.response_count = 0;
    self.last_response = null;

    self.getSockets = function(){
	return [self.request_socket];
    };

    self.fire = function(config){
	console.log("cylinder.fire");
	self.request_socket.send(config);
    };

    self.getResponseCount = function(){
	return self.response_count;
    };

    self.getLastResponse = function(){
	return self.last_response;
    };
};

describe("Piston", function(){
    it("responds to cylinder requests", function(){
	var myCylinder = new mockCylinder();
	var myPiston = new engine.piston({
	    endpoint: PISTON_ENDPOINT
	});

	myCylinder.fire(JSON.stringify(SIMPLE_PAYLOAD));
	
	waitsFor(function(){
	    return myCylinder.getResponseCount() != 0;
	}, "The request was never responded to", 5000);

	runs(function(){
	    expect(myCylinder.getResponseCount()).toEqual(1);
	    myPiston.getSockets().forEach(function(socket){
		socket.close();
	    });
	    myCylinder.getSockets().forEach(function(socket){
		socket.close();
	    });
	});
    });

    it("evaluates user-code against a given context", function(){
	var myCylinder = new mockCylinder();
	var myPiston = new engine.piston({
	    endpoint: PISTON_ENDPOINT
	});

	myCylinder.fire(JSON.stringify(SIMPLE_PAYLOAD));
	
	waitsFor(function(){
	    return myCylinder.getResponseCount() != 0;
	}, "The request was never responded to", 5000);

	runs(function(){
	    var parsed_response = JSON.parse(myCylinder.getLastResponse());
	    expect(parsed_response['returned_data']).toEqual(2);
	    myPiston.getSockets().forEach(function(socket){
		socket.close();
	    });
	    myCylinder.getSockets().forEach(function(socket){
		socket.close();
	    });
	});


    });
});

