var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("execution watcher", function(){
    var process = new mock.process();
    var watcher = engine.cylinder.executionWatcher.make({
        threshold: 1000,
        piston_process: process
    });

    it("kills a process when it runs for too long",function(){
        spyOn(process,'kill');
        watcher.start();
        waits(2000);
        runs(function(){
            expect(process.kill).toHaveBeenCalled();
        });
    });

    it("restarts a killed process",function(){
        spyOn(process,'restart');
        watcher.start();
        waits(2000);
        runs(function(){
            expect(process.restart).toHaveBeenCalled();
        });
    });
});

