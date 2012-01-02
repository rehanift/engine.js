var logging_gateway = require("./logger/logging_gateway").logging_gateway,
    client_task_receiver = require("./intake/client_task_receiver").client_task_receiver,
    cylinder_task_sender = require("./intake/cylinder_task_sender").cylinder_task_sender;

var intake = function(client_task_receiver, cylinder_task_sender, logging_gateway){
    var self = this;
    self.client_task_receiver = client_task_receiver;
    self.cylinder_task_sender = cylinder_task_sender;
    self.logging_gateway = logging_gateway;
};

intake.make = function(options){
    options.client_task_receiver.on("task", function(task){
	options.cylinder_task_sender.send_task(task);
	options.logging_gateway.log({
	    task_id: task.getId(),
	    component: "Intake",
	    action: "Forwarded Task to Cylinders"
	});
    });
    
    var new_intake = new intake(options.client_task_receiver,
                                options.cylinder_task_sender,
				options.logging_gateway);

    options.logging_gateway.log({component: "Intake", 
    				 action: "Listening @ " + options.listening_endpoint});
    
    options.logging_gateway.log({component: "Intake", action: "Ready to send @ " +
    				  options.sending_endpoint});
    
    return new_intake;
};

intake.create = function(config){
    var provide_defaults = require("./helpers/provide_defaults");

    var options = provide_defaults(config,{
	listening_endpoint: "ipc:///tmp/intake-listener.ipc",
	sending_endpoint: "ipc:///tmp/cylinder-listener.ipc",
	logging_gateway: logging_gateway.create()
    });
    
    var receiver = client_task_receiver.create({
	listening_endpoint: options.listening_endpoint	
    });

    var sender = cylinder_task_sender.create({
	sending_endpoint: options.sending_endpoint
    });

    var new_intake = intake.make({
	client_task_receiver: receiver,
	cylinder_task_sender: sender,
	logging_gateway: options.logging_gateway
    });
    
    return new_intake;
};

intake.prototype.close = function(){
    this.logging_gateway.log({component: "Intake",action: "Closing"});
    this.client_task_receiver.close();
    this.cylinder_task_sender.close();
};

exports.intake = intake;