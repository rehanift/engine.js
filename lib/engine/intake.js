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