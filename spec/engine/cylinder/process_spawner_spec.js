var process_spawner = require("../../../lib/engine/cylinder/process_spawner").process_spawner,
    mock = require("../../spec_helper").mock;

describe("Process Spawner", function(){
    var strategy = jasmine.createSpy();
    var spawner = process_spawner.make({
        strategy: strategy
    });

    it("#spawn invokes the process_spawner's creation strategy", function(){
        spawner.spawn();
        expect(strategy).toHaveBeenCalled();
    });
});

