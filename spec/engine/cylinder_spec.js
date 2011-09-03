var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Cylinder", function(){
    var cylinder = engine.cylinder.make({
	id: "1",
	listening_socket: new mock.socket(),
	sending_socket: new mock.socket(),
	piston_process: new mock.process(),
	execution_watcher: new mock.execution_watcher()
    });    

    it("has an ID",function(){
	expect(cylinder.id).toBeTruthy();
    });
    
    describe("incoming tasks from intake", function(){
	it("are forwarded to the piston",function(){
	    spyOn(cylinder.sending_socket,'send');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    expect(cylinder.sending_socket.send).toHaveBeenCalled();
	});

	it("start an execution watcher",function(){
	    spyOn(cylinder.execution_watcher, 'start');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    expect(cylinder.execution_watcher.start).toHaveBeenCalled();
	});
    });

    describe("incoming evaluations from piston", function(){
	it("clear the execution timeout",function(){
	    spyOn(cylinder.execution_watcher,'clear');
	    cylinder.sending_socket.fakeSend({foo:"bar"});
	    expect(cylinder.execution_watcher.clear).toHaveBeenCalled();
	});

	it("are forwarded to the exhaust publisher",function(){
	    pending();
	});
    });
});