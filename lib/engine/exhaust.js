var exhaust = function(listening_socket, publishing_socket, logging_gateway){
    this.listening_socket = listening_socket;
    this.publishing_socket = publishing_socket;
    this.logging_gateway = logging_gateway;
};
exhaust.make = function(options){
    var new_exhaust = new exhaust(options.listening_socket, 
                                  options.publishing_socket,
				  options.logging_gateway);

    new_exhaust.listening_socket.on("message", function(data){
        var payload = JSON.parse(data);    
        var task_id = payload['task_id'];

	new_exhaust.logging_gateway.log({
	    task_id: task_id,
	    component: "Exhaust",
	    action: "Forwarding Task results to client"
	});
        new_exhaust.publishing_socket.send(task_id + " " + data);
    });

    return new_exhaust;
};

exhaust.create = function(options){
    var options = options || {};

    var context = require("zmq");
    var listening_socket = context.createSocket("pull");
    listening_socket.bind("tcp://127.0.0.1:5558", function(err){
        if (err) throw err;
    });

    var publishing_socket = context.createSocket("publisher");
    publishing_socket.bind("tcp://127.0.0.1:5556", function(err){
        if (err) throw err;
    });

    var logging_gateway;
    if (typeof options.logging_gateway == "undefined") {
	var logging_gateway_class = require("./logger/logging_gateway").logging_gateway;
	logging_gateway = logging_gateway_class.create();
    } else {
	logging_gateway = options.logging_gateway;
    }

    return exhaust.make({
        listening_socket: listening_socket,
        publishing_socket: publishing_socket,
	logging_gateway: logging_gateway
    });
};

exhaust.prototype.close = function(){
    this.logging_gateway.log({
	component: "Exhaust",
	action: "Closing"
    });
    this.listening_socket.close();
    this.publishing_socket.close();
};

exports.exhaust = exhaust;