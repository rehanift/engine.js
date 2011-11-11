var task = require("../../../lib/engine/client/task").task,
    mock = require("../../spec_helper").mock;

describe("task", function(){
    var new_task;

    beforeEach(function(){
	new_task = task.make({
            id: 2,
            client: new mock.client()
	});
    });

    it("#run runs through the task's client", function(){
        spyOn(new_task.client,'run');
        new_task.run();
        expect(new_task.client.run).toHaveBeenCalled();
    });

});