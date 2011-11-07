var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Task", function(){
    var task = engine.task.make({
        id: 2,
        client: new mock.client()
    });

    it("#run runs through the task's client", function(){
        spyOn(task.client,'run');
        task.run();
        expect(task.client.run).toHaveBeenCalled();
    });

});