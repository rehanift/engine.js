var piston_server = require("../../../lib/engine/piston/piston_server").piston_server;
var mock = require("../../spec_helper").mock;

var mock_piston = function(){};
mock_piston.prototype.process_request = function(){};
mock.piston = mock_piston;

describe("piston_server", function(){
    
    var server = piston_server.make({
        socket: new mock.socket(),
        watcher_socket: new mock.socket(),
        piston: new mock.piston(),
        result_socket: new mock.socket()
    });
    
    it("calls the piston to begin task execution", function(){
        spyOn(server.piston, 'process_request').andReturn(mock.TASK_RESULTS);        
        server.socket.fakeSend(mock.TASK_PAYLOAD);
        expect(server.piston.process_request).toHaveBeenCalled();
    });

    it("sends responses to the cylinder when the watcher has stopped", function(){
        spyOn(server.piston, 'process_request').andReturn(mock.TASK_RESULTS);        
        spyOn(server.result_socket,'send');
        server.socket.fakeSend(mock.TASK_PAYLOAD);
        expect(server.result_socket.send).toHaveBeenCalled();
    });

    it("#close closes all sockets", function(){
        spyOn(server.socket,'close');
        spyOn(server.result_socket,'close');
        server.close();
        expect(server.socket.close).toHaveBeenCalled();
        expect(server.result_socket.close).toHaveBeenCalled();
    });
});