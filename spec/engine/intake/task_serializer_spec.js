var task_serializer = require("../../../lib/engine/intake/task_serializer").task_serializer,
    task = require("../../../lib/engine/client/task").task;

describe("Task Serializer", function(){
    beforeEach(function(){
	this.serializer = task_serializer.make();
	this.task_as_json = {
	    task_id: "1",
	    context: "(function(){ return { add:function(){} } })",
	    code: "add(1,1)",
	    locals: {
		foo:"bar"
	    }
	};

	this.task_val_obj = task.restore_from_JSON(this.task_as_json);
	this.serialized_task = this.serializer.serialize(this.task_val_obj);
    });

    it("serializes a task object into a string", function(){
	expect(typeof this.serialized_task === "string").toBeTruthy();

	expect(this.serialized_task).toContain(this.task_as_json.task_id);
	expect(this.serialized_task).toContain(this.task_as_json.context);
	expect(this.serialized_task).toContain(this.task_as_json.code);
	expect(this.serialized_task).toContain(this.task_as_json.locals.foo);
    });
});