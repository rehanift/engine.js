var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Exhaust", function(){    
    var exhaust = engine.exhaust.make({
        listening_socket: new mock.socket(),
        publishing_socket: new mock.socket(),
	logging_gateway: new mock.logging_gateway()
    });

    it("publishes received messages", function(){
        spyOn(exhaust.publishing_socket,'send');
        exhaust.listening_socket.fakeSend('{"hello":"world"}');
        expect(exhaust.publishing_socket.send).toHaveBeenCalled();
    });

    it("publishes to a task id channel", function(){
        spyOn(exhaust.publishing_socket,'send');
        var payload = '{"task_id":"foo"}';
        exhaust.listening_socket.fakeSend(payload);
        expect(exhaust.publishing_socket.send).toHaveBeenCalledWith("foo " + payload);
    });

    it("#close closes all sockets", function(){
        spyOn(exhaust.listening_socket,'close');
        spyOn(exhaust.publishing_socket,'close');
        exhaust.close();
        expect(exhaust.listening_socket.close).toHaveBeenCalled();
        expect(exhaust.publishing_socket.close).toHaveBeenCalled();
    });
    
});