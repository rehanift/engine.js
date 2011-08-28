var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Intake", function(){
    describe("listening socket", function(){
	it("emits a 'listener ready' event when it successfully binds",function(){
	    var intake = mock.createIntake();
	    var callback = jasmine.createSpy();
	    intake.on("listener ready", callback);
	    
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback.callCount).toBe(1);
	    });
	});
	
	it("forwards messages to the sending socket",function(){
	    var intake = mock.createIntake();
	    spyOn(intake.sending_socket,'send');
	    var callback = jasmine.createSpy();

	    intake.on("ready", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		intake.listening_socket.fakeSend({foo:"bar"});
		expect(intake.sending_socket.send).toHaveBeenCalled();		
	    });
	});
    });

    describe("sending socket", function(){
	it("emits a 'sender ready' event when it successfully binds",function(){
	    var intake = mock.createIntake();
	    var callback = jasmine.createSpy();
	    intake.on("sender ready", callback);
	    
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback.callCount).toBe(1);
	    });
	});
    });

    it("emits a 'ready' event when both listening and sending sockets are bound",function(){
	var intake = mock.createIntake();
	var callback = jasmine.createSpy();
	intake.on("ready", callback);
	
	waitsFor(function(){
	    return callback.callCount > 0;
	});

	runs(function(){
	    expect(callback.callCount).toBe(1);
	});
    });

});