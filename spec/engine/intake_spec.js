var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Intake", function(){
    var intake;
        
    beforeEach(function(){
        intake = engine.intake.make({
            listening_socket: new mock.socket(),
            sending_socket: new mock.socket(),
	    logging_gateway: new mock.logging_gateway()
        });
    });        
        
    
    it("forwards messages from the listening socket to the sending socket",function(){
	spyOn(intake.sending_socket,'send');
	
	var message = JSON.stringify({foo:"bar"});

	intake.listening_socket.fakeSend(message);
        
	runs(function(){
	    expect(intake.sending_socket.send).toHaveBeenCalledWith(message);
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