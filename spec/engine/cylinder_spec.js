var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Cylinder", function(){
    it("has an ID",function(){
	var cylinder = mock.createCylinder();
	expect(cylinder.id).toBeTruthy();
    });
    
    describe("incoming tasks from intake", function(){
	it("are forwarded to the piston",function(){
	    var cylinder = mock.createCylinder();
	    spyOn(cylinder.sending_socket,'send');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    expect(cylinder.sending_socket.send).toHaveBeenCalled();
	});

	it("start an execution watcher",function(){
	    var cylinder = mock.createCylinder();
	    spyOn(cylinder.execution_watcher, 'start');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    expect(cylinder.execution_watcher.start).toHaveBeenCalled();
	});
    });

    describe("incoming evaluations from piston", function(){
	it("clear the execution timeout",function(){
	    var cylinder = mock.createCylinder();
	    spyOn(cylinder.execution_watcher,'clear');
	    cylinder.sending_socket.fakeSend({foo:"bar"});
	    expect(cylinder.execution_watcher.clear).toHaveBeenCalled();
	});

	it("are forwarded to the exhaust publisher",function(){
	    pending();
	});
    });

    describe("execution watcher", function(){
	it("kills a process when it runs for too long",function(){
	    var cylinder = mock.createCylinder();
	    spyOn(cylinder.piston_process,'kill');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    waits(2000);
	    runs(function(){
		expect(cylinder.piston_process.kill).toHaveBeenCalled();
	    });
	});

	it("restarts a killed process",function(){
	    var cylinder = mock.createCylinder();
	    spyOn(cylinder.piston_process,'restart');
	    cylinder.listening_socket.fakeSend({foo:"bar"});
	    waits(2000);
	    runs(function(){
		expect(cylinder.piston_process.restart).toHaveBeenCalled();
	    });
	});
    });
});