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
	new_intake.sending_socket.send(data);
    });

    return new_intake;
};

intake.create = function(options){
    var context = require("zeromq");
    var listening_socket = context.createSocket("pull");
    var sending_socket = context.createSocket("push");

    var intake = new intake(listening_socket, sending_socket);
    
    intake.initialize_sockets(options);

    return intake;
};

intake.prototype.initialize_sockets = function(options){
    var self = this;
    
    self.listening_socket.bind(options.listening_endpoint, function(err){
	self.emit("listener ready");
    });

    self.sending_socket.bind(options.sending_endpoint, function(err){
	self.emit("sender ready");
    });

    var handleCheckoff = function(remaining){
	if (remaining.length == 0) {
	    self.emit("ready");
	}
    };

    self.on("listener ready", function(){
	self.checkoff("listener", handleCheckoff);
    });

    self.on("sender ready", function(){
	self.checkoff("sender", handleCheckoff);
    });

    self.listening_socket.on("message", function(data){
	self.sending_socket.send(data);
    });
};

exports.intake = intake;