var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Intake", function(){
    var intake;
        
    beforeEach(function(){
        intake = engine.intake.make({
            listening_socket: new mock.socket(),
            sending_socket: new mock.socket()
        });
    });        
        
    it("emits a 'listener ready' event when the listening socket successfully binds",function(){
	var callback = jasmine.createSpy();
	intake.on("listener ready", callback);
	
	waitsFor(function(){
	    return callback.callCount > 0;
	});
        
	runs(function(){
	    expect(callback.callCount).toBe(1);
	});
    });
    
    it("forwards messages from the listening socket to the sending socket",function(){
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

    it("emits a 'sender ready' event when the sending socket successfully binds",function(){
	var callback = jasmine.createSpy();
	intake.on("sender ready", callback);
	
	waitsFor(function(){
	    return callback.callCount > 0;
	});
        
	runs(function(){
	    expect(callback.callCount).toBe(1);
	});
    });

    it("emits a 'ready' event when both listening and sending sockets are bound",function(){
	var callback = jasmine.createSpy();
	intake.on("ready", callback);
	
	waitsFor(function(){
	    return callback.callCount > 0;
	});

	runs(function(){
	    expect(callback.callCount).toBe(1);
	});
    });
  
    it("#close closes all sockets", function(){
        spyOn(intake.listening_socket,'close');
        spyOn(intake.sending_socket,'close');
        intake.close();
        expect(intake.listening_socket.close).toHaveBeenCalled();
        expect(intake.sending_socket.close).toHaveBeenCalled();
    });
});