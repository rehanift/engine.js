var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;
var util = require("util"), events = require("events");

describe("Intake", function(){
    beforeEach(function(){
	this.task_receiver = new mock.client_task_receiver();
	this.task_sender = new mock.cylinder_task_sender();

        this.intake = engine.intake.make({
            client_task_receiver: this.task_receiver,
            cylinder_task_sender: this.task_sender,
	    logging_gateway: new mock.logging_gateway()
        });
    });        
        
    
    it("forwards tasks from clients to cylinders",function(){
	var task = {};
	this.task_receiver.emit_task(task);
	expect(this.task_sender.send).toHaveBeenCalledWith(task);
    });
  
    it("#close closes all sockets", function(){
	spyOn(this.task_receiver,'close');
	spyOn(this.task_sender,'close');
        this.intake.close();
        expect(this.task_receiver.close).toHaveBeenCalled();
        expect(this.task_sender.close).toHaveBeenCalled();
    });
});