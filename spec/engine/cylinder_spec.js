var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Cylinder", function(){    
    var cylinder;

    beforeEach(function(){
        cylinder = engine.cylinder.make({
	    id: "1",
	    listening_socket: new mock.socket(),
	    sending_socket: new mock.socket(),
	    results_socket: new mock.socket(),
            exhaust_socket: new mock.socket(),
	    execution_watcher: new mock.execution_watcher(),
            process_spawner: new mock.process_spawner(),
	    logging_gateway: new mock.logging_gateway()
        });    
    });

    it("when a cylinder receives a task it sends it to the piston", function(){
        spyOn(cylinder.sending_socket,'send');
        cylinder.listening_socket.fakeSend(mock.TASK_PAYLOAD);
        expect(cylinder.sending_socket.send).toHaveBeenCalled();
    });

    describe("when a piston receives a task", function(){
        it("the watcher is started", function(){
            spyOn(cylinder.execution_watcher,'start');
            cylinder.listening_socket.fakeSend(mock.TASK_PAYLOAD);
            expect(cylinder.execution_watcher.start).toHaveBeenCalled();
        });        
    });

    it("when a piston finishes executing a task the cylinder clears the watcher", function(){
        spyOn(cylinder.execution_watcher,'clear');
        cylinder.results_socket.fakeSend(mock.TASK_RESULTS);
        expect(cylinder.execution_watcher.clear).toHaveBeenCalled();
    });

    it("when a piston finishes executing a task the cylinder sends the results to the exhaust publisher", function(){
        spyOn(cylinder.exhaust_socket,'send');
        cylinder.results_socket.fakeSend(mock.TASK_RESULTS);
        expect(cylinder.exhaust_socket.send).toHaveBeenCalled();        
    });

    describe("when a piston has been executing for too long", function(){
        it("kills the piston", function(){
            var old_piston = cylinder.piston_process;
            spyOn(old_piston,'kill');
            cylinder.current_task = mock.TASK_PAYLOAD;
            cylinder.execution_watcher.emit("kill");
            old_piston.emit("exit");
            expect(old_piston.kill).toHaveBeenCalled();
        });

        it("starts a new piston process", function(){
            spyOn(cylinder.process_spawner,'spawn');
            cylinder.current_task = mock.TASK_PAYLOAD;
            cylinder.execution_watcher.emit("kill");
            cylinder.piston_process.emit("exit");
            expect(cylinder.process_spawner.spawn).toHaveBeenCalled();
        });

        it("replaces the cylinder's piston reference", function(){
            var old_piston = cylinder.piston_process;
            cylinder.current_task = mock.TASK_PAYLOAD;
            cylinder.execution_watcher.emit("kill");
            old_piston.emit("exit");
            expect(cylinder.piston_process).toBeTruthy();
            expect(cylinder.piston_process).not.toBe(old_piston);
        });
    });

    it("#close closes all sockets", function(){
        spyOn(cylinder.listening_socket,'close');
        spyOn(cylinder.sending_socket,'close');
        spyOn(cylinder.results_socket,'close');
        spyOn(cylinder.exhaust_socket,'close');
        spyOn(cylinder.piston_process,'kill');
        cylinder.close();
        expect(cylinder.listening_socket.close).toHaveBeenCalled();
        expect(cylinder.sending_socket.close).toHaveBeenCalled();
        expect(cylinder.results_socket.close).toHaveBeenCalled();
        expect(cylinder.exhaust_socket.close).toHaveBeenCalled();
        expect(cylinder.piston_process.kill).toHaveBeenCalled();
    });

});