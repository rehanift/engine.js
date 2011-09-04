var engine = function(){};
var util = require("util"),
    Checklist = require("../mixins/checklist").Checklist,
    events = require("events");

var intake = function(listening_socket, sending_socket){
    var self = this;
    self.listening_socket = listening_socket;
    self.sending_socket = sending_socket;
    self.setRequirements(["listener","sender"]);
};
util.inherits(intake, events.EventEmitter);
Checklist.call(intake.prototype);

intake.make = function(options){
    var new_intake = new intake(options.listening_socket,
                                options.sending_socket);

    new_intake.listening_socket.bind(options.listening_endpoint, function(err){
        if (err) throw err;
        new_intake.emit("listener ready");
    });

    new_intake.sending_socket.bind(options.sending_endpoint, function(err){
        if (err) throw err;
        new_intake.emit("sender ready");
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
        console.log("intake",data.toString());
	new_intake.sending_socket.send(data);
    });

    return new_intake;
};

intake.create = function(options){
    var context = require("zeromq");
    var listening_socket = context.createSocket("pull");
    var sending_socket = context.createSocket("push");

    var new_intake = intake.make({
        listening_socket: listening_socket,
        listening_endpoint: "ipc://intake_manifold.ipc",
        sending_socket: sending_socket,
        sending_endpoint: "ipc://cylinder_block.ipc"        
    });
    
    return new_intake;
};

intake.prototype.close = function(){
    this.listening_socket.close();
    this.sending_socket.close();
};

exports.intake = intake;