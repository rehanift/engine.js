var engine = require("../../engine").engine;
var helpers = {};

var num_to_s = helpers.num_to_s = function(some_number){
    return (new Number(some_number)).toString();
};

var logging_gateway = engine.logging_gateway.create();
//var stdout_client = engine.logging_stdout_client.create();
//logging_gateway.add_logger(stdout_client);

helpers.create_tcp_intake = function(listening_port, sending_port){
    return engine.intake.create({
	listening_endpoint: "tcp://*:"+listening_port,
	sending_endpoint: "tcp://*:"+sending_port,
	logging_gateway: logging_gateway
    });
};

helpers.create_tcp_exhaust = function(listening_port, publishing_port){
    return engine.exhaust.create({
	listening_endpoint: "tcp://*:"+listening_port,
	publishing_endpoint: "tcp://*:"+publishing_port,
	logging_gateway: logging_gateway
    });
};

helpers.create_ipc_intake = function(identifier){
    return engine.intake.create({
	listening_endpoint: "ipc:///tmp/intake-listener-"+identifier+".ipc",
	sending_endpoint: "ipc:///tmp/cylinder-listener-"+identifier+".ipc",
	logging_gateway: logging_gateway
    });
};

helpers.create_ipc_exhaust = function(identifier){
    return engine.exhaust.create({
	listening_endpoint: "ipc:///tmp/exhaust-listener-"+identifier+".ipc",
	publishing_endpoint: "ipc:///tmp/exhaust-publisher-"+identifier+".ipc",
	logging_gateway: logging_gateway
    });
};

helpers.create_tcp_clients = function(num, sending_port, listening_port){
    var clients = {};
    for(var i=1; i<=num; i++){
	clients[num_to_s(i)] = engine.client.create({
	    sending_endpoint: "tcp://127.0.0.1:"+sending_port,
	    listening_endpoint: "tcp://127.0.0.1:"+listening_port
	});	
    }
    return clients;
};

helpers.create_ipc_clients = function(num, identifier){
    var clients = {};
    for(var i=1; i<=num; i++){
	clients[num_to_s(i)] = engine.client.create({
	    sending_endpoint: "ipc:///tmp/intake-listener-"+identifier+".ipc",
	    listening_endpoint: "ipc:///tmp/exhaust-publisher-"+identifier+".ipc"
	});	
    }
    return clients;
};

helpers.create_tcp_cylinders = function(num, listening_port, exhaust_port){
    var cylinders = {};
    for(var i=1; i<=num; i++){
	cylinders[num_to_s(i)] = engine.cylinder.create({
	    listening_endpoint: "tcp://127.0.0.1:"+listening_port,
	    exhaust_endpoint: "tcp://127.0.0.1:"+exhaust_port,
	    threshold: 2000,
	    logging_gateway: logging_gateway
	});	
    }
    return cylinders;
};

helpers.create_ipc_cylinders = function(num, identifier){
    var cylinders = {};
    for(var i=1; i<=num; i++){
	cylinders[num_to_s(i)] = engine.cylinder.create({
	    listening_endpoint: "ipc:///tmp/cylinder-listener-"+identifier+".ipc",
	    exhaust_endpoint: "ipc:///tmp/exhaust-listener-"+identifier+".ipc",
	    threshold: 2000,
	    logging_gateway: logging_gateway
	});	
    }
    return cylinders;
};

exports.helpers = helpers;