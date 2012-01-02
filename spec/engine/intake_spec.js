var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Intake", function(){
    beforeEach(function(){
	this.task_receiver = new mock.client_task_receiver();
	this.task_sender = new mock.cylinder_task_sender();
	this.logging_gateway = new mock.logging_gateway();

        this.intake = engine.intake.make({
            client_task_receiver: this.task_receiver,
            cylinder_task_sender: this.task_sender,
	    logging_gateway: this.logging_gateway
        });
    });

    it("logs a message when successfully created", function(){
	spyOn(this.logging_gateway,'log');
	var intake = engine.intake.make({
            client_task_receiver: this.task_receiver,
            cylinder_task_sender: this.task_sender,
	    logging_gateway: this.logging_gateway	    
	});
	expect(this.logging_gateway.log).toHaveBeenCalled();
    });
    
    it("forwards tasks from clients to cylinders",function(){
	spyOn(this.task_sender,'send_task');
	var task = new mock.task();
	this.task_receiver.emit("task",task);
	expect(this.task_sender.send_task).toHaveBeenCalledWith(task);
    });        

    it("logs a message when a task is forwarded",function(){
	spyOn(this.logging_gateway,'log');
	var task = new mock.task();
	this.task_receiver.emit("task",task);
	expect(this.logging_gateway.log).toHaveBeenCalled();
    });

    describe("#close", function(){
	it("closes the receiver socket", function(){
	    spyOn(this.task_receiver,'close');
            this.intake.close();
            expect(this.task_receiver.close).toHaveBeenCalled();
	});

	it("closes the sender socket", function(){
	    spyOn(this.task_sender,'close');
            this.intake.close();
            expect(this.task_sender.close).toHaveBeenCalled();
	});

	it("logs a message when a task is forwarded",function(){
	    spyOn(this.logging_gateway,'log');
	    this.intake.close();
	    expect(this.logging_gateway.log).toHaveBeenCalled();
	});

    });
});