var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("Task", function(){
    var task = engine.task.make({
        id: 2,
        client: new mock.client(),
        subscriber_socket: new mock.socket(),
        callback: function(){}
    });

    it("#run runs through the task's client", function(){
        spyOn(task.client,'run');
        task.run();
        expect(task.client.run).toHaveBeenCalled();
    });

    it("correctly parses received messages", function(){
        spyOn(task,'call_callback');
        task.subscriber_socket.fakeSend('task-123 {"foo":"hello world"}');
        expect(task.call_callback).toHaveBeenCalledWith('{"foo":"hello world"}');
    });

    it("calls its callback when results are received", function(){
        spyOn(task,'call_callback');
        task.subscriber_socket.fakeSend("{}");
        expect(task.call_callback).toHaveBeenCalled();
    });

});