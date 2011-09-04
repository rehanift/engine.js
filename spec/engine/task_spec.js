var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Task", function(){
    var task = engine.task.make({
        id: 2,
        client: new mock.client(),
        subscriber_socket: new mock.socket()
    });

    it("#run runs through the task's client", function(){
        spyOn(task.client,'run');
        task.run();
        expect(task.client.run).toHaveBeenCalled();
    });

    it("emits an 'output' event when console messages are received", function(){
        spyOn(task,'emit');
        task.subscriber_socket.fakeSend('task-123 {"task_id":"task-123", "console":"hello world"}');
        expect(task.emit).toHaveBeenCalledWith('output', 'hello world');
    });

    it("emits an 'eval' event when evaluation messages are received", function(){
        spyOn(task,'emit');
        task.subscriber_socket.fakeSend('task-123 {"task_id":"task-123", "last_eval":"hello world"}');
        expect(task.emit).toHaveBeenCalledWith('eval','hello world');
    });

});