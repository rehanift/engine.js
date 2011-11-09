var engine = function(){};
var util = require("util"),
    Checklist = require("../mixins/checklist").Checklist,
    logging_gateway = require("./logger/logging_gateway").logging_gateway,
    events = require("events");

var intake = function(listening_socket, sending_socket, logging_gateway){
    var self = this;
    self.listening_socket = listening_socket;
    self.sending_socket = sending_socket;
    self.setRequirements(["listener","sender"]);
    self.logging_gateway = logging_gateway;
};
util.inherits(intake, events.EventEmitter);
Checklist.call(intake.prototype);

intake.make = function(options){
    var new_intake = new intake(options.listening_socket,
                                options.sending_socket,
				options.logging_gateway);

    new_intake.logging_gateway.log({component: "Intake", action: "Created"});

    new_intake.listening_socket.bind(options.listening_endpoint, function(err){
        if (err) throw err;
        new_intake.emit("listener ready");
	new_intake.logging_gateway.log({component: "Intake", 
					action: "Listening @ " + options.listening_endpoint});
    });

    new_intake.sending_socket.bind(options.sending_endpoint, function(err){
        if (err) throw err;
        new_intake.emit("sender ready");
	new_intake.logging_gateway.log({component: "Intake", action: "Ready to send @ " +
				       options.sending_endpoint});
    });
    
    var handleCheckoff = function(remaining){
	if (remaining.length == 0) {
	    new_intake.emit("ready");
	}
    };

    new_intake.on("listener ready", function(){
	new_intake.checkoff("listener", handleCheckoff);
    });

    new_intake.on("sender ready", function(){
	new_intake.checkoff("sender", handleCheckoff);
    });

    new_intake.listening_socket.on("message", function(data){
	new_intake.sending_socket.send(data);
	var parsed_data = JSON.parse(data.toString());
	new_intake.logging_gateway.log({
	    task_id: parsed_data.task_id,
	    component: "Intake",
	    action: "Forwarding to Cylinder"
	});
    });

    return new_intake;
};

intake.create = function(config){
    var provide_defaults = require("./helpers/provide_defaults");

    var context = require("zmq");
    var listening_socket = context.createSocket("pull");
    var sending_socket = context.createSocket("push");

    var options = provide_defaults(config,{
	listening_endpoint: "ipc://intake-listener.ipc",
	sending_endpoint: "ipc://cylinder-listener.ipc",
	logging_gateway: logging_gateway.create()
    });
    
    var new_intake = intake.make({
        listening_socket: listening_socket,
        listening_endpoint: options.listening_endpoint,
        sending_socket: sending_socket,
        sending_endpoint: options.sending_endpoint,
	logging_gateway: options.logging_gateway
    });
    
    return new_intake;
};

intake.prototype.close = function(){
    this.logging_gateway.log({component: "Intake",action: "Closing"});
    this.listening_socket.close();
    this.sending_socket.close();
};

exports.intake = intake;