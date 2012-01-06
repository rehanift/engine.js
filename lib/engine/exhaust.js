var logging_gateway = require("./logger/logging_gateway").logging_gateway;

var exhaust = function(listening_socket, publishing_socket, logging_gateway){
    this.listening_socket = listening_socket;
    this.publishing_socket = publishing_socket;
    this.logging_gateway = logging_gateway;
};

exhaust.make = function(options){
    var new_exhaust = new exhaust(options.listening_socket, 
                                  options.publishing_socket,
				  options.logging_gateway);

    new_exhaust.logging_gateway.log({component: "Exhaust", action: "Created"});

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

exhaust.create = function(config){
    var provide_defaults = require("./helpers/provide_defaults");
    var options = provide_defaults(config,{
	listening_endpoint: "ipc:///tmp/exhaust-listener.ipc",
	publishing_endpoint: "ipc:///tmp/exhaust-publisher.ipc",
	logging_gateway: logging_gateway.create()
    });

    var context = require("zmq");
    var listening_socket = context.socket("pull");
    listening_socket.bind(options.listening_endpoint, function(err){
        if (err) throw err;
    });

    var publishing_socket = context.socket("pub");
    publishing_socket.bind(options.publishing_endpoint, function(err){
        if (err) throw err;
    });

    return exhaust.make({
        listening_socket: listening_socket,
        publishing_socket: publishing_socket,
	logging_gateway: options.logging_gateway
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