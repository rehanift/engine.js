var client_task_receiver = require("../../../lib/engine/intake/client_task_receiver").client_task_receiver;
var mock = require("../../spec_helper").mock;
var engine = require("../../../engine").engine;

describe("Client Task Receiver", function(){
    beforeEach(function(){	
	this.client_connection = new mock.client_connection();
	this.task_translator = new mock.task_translator();
	this.receiver = client_task_receiver.make({
	    client_connection: this.client_connection,
	    task_translator: this.task_translator
	});
	this.raw_task = JSON.stringify({
	    task_id: "1",
	    context: "(function(){ return { add:function(){} } })",
	    code: "add(1,1)",
	    locals: {
		foo:"bar"
	    }
	});	
    });

    describe("receiving a task", function(){
	it("translates a raw message into a task object", function(){
	    spyOn(this.task_translator,'translate');
	    this.client_connection.emit("task", this.raw_task);
	    expect(this.task_translator.translate).toHaveBeenCalledWith(this.raw_task);
	});
	
	it("emits a task", function(){
	    var task = new mock.task();
	    spyOn(this.receiver,'emit');
	    spyOn(this.task_translator,'translate').andReturn(task);
	    this.client_connection.emit("task", this.raw_task);
	    expect(this.receiver.emit).toHaveBeenCalledWith('task',task);
	});
    });
    
    describe("#close", function(){
	it("closes the internal connection", function(){
	    spyOn(this.client_connection,'close');
	    this.receiver.close();
	    expect(this.client_connection.close).toHaveBeenCalled();
	});
    });
});