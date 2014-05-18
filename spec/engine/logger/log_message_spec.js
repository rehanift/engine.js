var engine = require("../../../engine").engine;
var mock = require("../../spec_helper").mock;

describe("Log Message", function(){
    var log_message,
	data;

    process.env.TZ = 'America/Los_Angeles';

    beforeEach(function(){
	data = {
	    hello: "world",
	    foo: ["bar","baz"]
	};
	log_message = engine.log_message.make({
	    task_id: "123",
	    component: "test component",
	    action: "is undergoing a test",
	    data: data,
	    datetime: new Date(0)
	});
    });

    it("returns its properties via get()", function(){
	expect(log_message.get('task_id')).toBe("123");
	expect(log_message.get('component')).toBe('test component');
	expect(log_message.get('action')).toBe('is undergoing a test');
	expect(log_message.get('data')).toBe(data);
	expect(log_message.get('datetime').toString()).toBe("Wed Dec 31 1969 16:00:00 GMT-0800 (PST)");
    });

    it("has() returns whether a property exists or not", function(){
	expect(log_message.has('foo')).not.toBeTruthy();
	expect(log_message.has('action')).toBeTruthy();
    });
});