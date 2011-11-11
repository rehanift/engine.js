var execution_watcher = require("../../../lib/engine/cylinder/execution_watcher").execution_watcher,
    mock = require("../../spec_helper").mock;

describe("execution watcher", function(){
    var watcher = execution_watcher.make({
        threshold: 100
    });
    
    it("emits a 'kill' event when the threshold has expired", function(){
        spyOn(watcher,'emit');
        watcher.start();
        waits(500);
        runs(function(){
            expect(watcher.emit).toHaveBeenCalledWith("kill");
        });
    });

    it("throws an error when calling start on an already started watcher", function(){
        expect(function(){
            watcher.start();
            watcher.start();
        }).toThrow("This watcher has already been started");
    });
});

