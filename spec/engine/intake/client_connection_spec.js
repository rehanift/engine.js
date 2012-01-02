var client_connection = require("../../../lib/engine/intake/client_connection").client_connection,
    mock = require("../../spec_helper").mock;

describe("Client Connection", function(){
    beforeEach(function(){
	this.socket = new mock.zmq_socket();
	this.connection = client_connection.make({
	    socket: this.socket
	});
    });

    it("emits 'task' messages as strings", function(){
	var message = "hello world";	
	spyOn(this.connection,'emit');
	this.socket.emit('message', new Buffer(message));
	expect(this.connection.emit).toHaveBeenCalledWith('task',message);
    });

    describe("#close", function(){
	it('closes the internal socket', function(){
	    spyOn(this.socket,'close');
	    this.connection.close();
	    expect(this.socket.close).toHaveBeenCalled();
	});
    });
});