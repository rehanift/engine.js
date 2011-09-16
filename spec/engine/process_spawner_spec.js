var engine = require("../../engine").engine,
    mock = require("../spec_helper").mock;

describe("Process Spawner", function(){
    var strategy = jasmine.createSpy();
    var spawner = engine.process_spawner.make({
        strategy: strategy
    });

    it("#spawn invokes the process_spawner's creation strategy", function(){
        spawner.spawn();
        expect(strategy).toHaveBeenCalled();
    });
});

