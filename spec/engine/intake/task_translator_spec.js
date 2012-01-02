var task_translator = require("../../../lib/engine/intake/task_translator").task_translator,
    task = require("../../../lib/engine/client/task").task;

describe("Task Translator", function(){
    beforeEach(function(){
	this.translator = task_translator.make();
    });

    it("translates a task string to an engine.task object", function(){
	var task_as_object = {
	    task_id: "1",
	    context: "(function(){ return { add:function(){} } })",
	    code: "add(1,1)",
	    locals: {
		foo:"bar"
	    }
	};

	var task_as_string = JSON.stringify(task_as_object);

	var translated_task = this.translator.translate(task_as_string);

	expect(translated_task instanceof task).toBeTruthy();
	expect(translated_task.getId()).toBe(task_as_object.task_id);
	expect(translated_task.getContext()).toBe(task_as_object.context);
	expect(translated_task.getCode()).toBe(task_as_object.code);
	expect(translated_task.getLocals()).toEqual(task_as_object.locals);
    });
});