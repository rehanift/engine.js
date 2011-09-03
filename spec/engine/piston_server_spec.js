var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

var mock_piston = function(){};
mock_piston.prototype.process_request = function(){};
mock.piston = mock_piston;

describe("pistonServer", function(){

    var socket = new mock.socket(),
        piston = new mock.piston();
    
    var server = engine.piston.server.make({
        socket: socket,
        piston: piston
    });

    it("accepts requests", function(){
        spyOn(server,'accept_request');
        server.socket.fakeSend({foo:"bar"});       
        expect(server.accept_request).toHaveBeenCalled();
    });

    it("processes requests through the piston", function(){
        spyOn(server.piston, 'process_request');
        server.socket.fakeSend({foo:"bar"});       
        expect(server.piston.process_request).toHaveBeenCalled();
    });

    it("sends responses", function(){
        spyOn(server.socket,'send');
        server.socket.fakeSend({foo:"bar"});
        expect(socket.send).toHaveBeenCalled();
    });

});