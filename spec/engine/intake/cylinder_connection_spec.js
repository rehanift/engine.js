var cylinder_connection = require("../../../lib/engine/intake/cylinder_connection").cylinder_connection,
    mock = require("../../spec_helper").mock;

describe("Cylinder Connection", function(){
    beforeEach(function(){
	this.socket = new mock.zmq_socket();
	this.connection = cylinder_connection.make({
	    socket: this.socket
	});
    });

    it("sends serialized tasks to the cylinders", function(){
	var task = "foo";
	spyOn(this.socket,'send');
	this.connection.send(task);
	expect(this.socket.send).toHaveBeenCalledWith(task);
    });

    describe("#close", function(){
	it('closes the internal socket', function(){
	    spyOn(this.socket,'close');
	    this.connection.close();
	    expect(this.socket.close).toHaveBeenCalled();
	});
    });
});