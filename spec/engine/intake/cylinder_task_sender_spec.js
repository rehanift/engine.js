var cylinder_task_sender = require("../../../lib/engine/intake/cylinder_task_sender").cylinder_task_sender,
    mock = require("../../spec_helper").mock;

describe("Cylinder Task Sender", function(){
    beforeEach(function(){
	this.connection = new mock.cylinder_connection();
	this.serializer = new mock.task_serializer();
	this.sender = cylinder_task_sender.make({
	    cylinder_connection: this.connection,
	    task_serializer: this.serializer
	});
    });

    it("serializes a task object into a string", function(){
	var task = new mock.task();

	spyOn(this.serializer,'serialize');

	this.sender.send_task(task);
	expect(this.serializer.serialize).toHaveBeenCalledWith(task);
    });

    it("sends a task to the cylinder connection", function(){	
	var serialized_task = "foo";
	var task = new mock.task();

	spyOn(this.connection,'send');
	spyOn(this.serializer,'serialize').andReturn(serialized_task);

	this.sender.send_task(task);
	expect(this.connection.send).toHaveBeenCalledWith(serialized_task);
    });

    describe("#close", function(){
	it("closes the cylinder connection", function(){
	    spyOn(this.connection,'close');

	    this.sender.close();
	    expect(this.connection.close).toHaveBeenCalled();
	});
    });
});