var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Exhaust", function(){    
    var exhaust = engine.exhaust.make({
        listening_socket: new mock.socket(),
        publishing_socket: new mock.socket()
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
    
});