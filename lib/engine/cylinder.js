var engine = function(){};
engine.process = require("./process").process;
engine.constants = require("./constants").constants;
engine.util = require("./util");
var executionWatcher = require("./executionWatcher").executionWatcher;

var cylinder = function(id, listening_socket, sending_socket, exhaust_socket,
			execution_watcher) {
    var self = this;
    self.id = id;
    self.listening_socket = listening_socket;
    self.sending_socket = sending_socket;
    self.exhaust_socket = exhaust_socket;
    self.execution_watcher = execution_watcher;
};

cylinder.make = function(config){
    var new_cylinder = new cylinder(config.id,
				    config.listening_socket,
				    config.sending_socket,
				    config.exhaust_socket,
				    config.execution_watcher);

    new_cylinder.listening_socket.on("message", function(data){
        console.log("cylinder",data.toString());
	new_cylinder.sending_socket.send(data);
	new_cylinder.execution_watcher.start();
    });

    new_cylinder.sending_socket.on("message", function(data){
        console.log("cylinder", data.toString());
	new_cylinder.execution_watcher.clear();
        new_cylinder.exhaust_socket.send(data.toString());
    });

    return new_cylinder;
};

cylinder.create = function(options){
    var id = engine.util.makeUUID({prefix:'cylinder'});

    var context = require("zeromq");
    var listening_socket = context.createSocket("pull");
    listening_socket.connect("ipc://cylinder_block.ipc");

    var sending_socket = context.createSocket("req");
    sending_socket.connect("ipc://"+id+".ipc");

    var exhaust_socket = context.createSocket("push");
    exhaust_socket.connect("ipc://exhaust_collector.ipc");

    var piston_process = engine.process.create({
        file: "./script/piston.js",
        arguments: [id]
    });

    piston_process.process.stdout.on("data", function(data){
        console.log("piston stdout", data.toString());
    });

    piston_process.process.stderr.on("data", function(data){
        console.log("piston stderr", data.toString());
    });

    var watcher = cylinder.executionWatcher.make({
        threshold: 5000,
        piston_process: piston_process
    });

    var new_cylinder = cylinder.make({
        listening_socket: listening_socket,
        sending_socket: sending_socket,
        exhaust_socket: exhaust_socket,
        execution_watcher: watcher
    });

    return new_cylinder;
};

cylinder.prototype.close = function(){
    this.listening_socket.close();
    this.sending_socket.close();
    this.exhaust_socket.close();
    this.execution_watcher.piston_process.kill();
};

cylinder.executionWatcher = executionWatcher;
/*
var cylinder = function(options){
    var context = require('zeromq');
    var self = this;

    self.id = engine.util.makeUUID({prefix:"cylinder"});
    var cylinder_id_parts = self.id.split('-');
    var cylinder_short_id = cylinder_id_parts[0]+'-'+cylinder_id_parts[1];

    // Theres probably a better way to do this
    var defaults = {
	intake: {
	    endpoint: "ipc://code.ipc",
	    callback: function(data){
		console.log("Intake Callback",data.toString());
	    }
	},
	compression: {
	    endpoint: "ipc://compression-"+cylinder_short_id+".ipc",
	    callback: function(data){
		console.log("Compression callback");
	    },
	    timeout: 10000
	}
    };
    
    var intake_endpoint = defaults.intake.endpoint;
    var intake_callback = defaults.intake.callback;
    var compression_endpoint = defaults.compression.endpoint;
    var compression_callback = defaults.compression.callback;
    var compression_timeout = defaults.compression.timeout;

    if(typeof options != "undefined"){
	if (typeof options.intake != "undefined") {
	    if (typeof options.intake.endpoint != "undefined") {
		intake_endpoint = options.intake.endpoint;
	    }

	    if (typeof options.intake.callback != "undefined") {
		intake_callback = options.intake.callback;
	    }
	}
	if (typeof options.compression != "undefined") {
	    if (typeof options.compression.endpoint != "undefined") {
		compression_endpoint = options.compression.endpoint;
	    }

	    if (typeof options.compression.callback != "undefined") {
		compression_callback = options.compression.callback;
	    }

	    if (typeof options.compression.timeout != "undefined") {
		compression_timeout = options.compression.timeout;
	    }
	}
    }

    self.intake = context.createSocket("pull");
    self.results_sender = context.createSocket("push");
    self.compression = context.createSocket("req");
    
    self.intake.connect(intake_endpoint);
    self.results_sender.connect("ipc://results.ipc");
    self.compression.connect(compression_endpoint);

    // create a new service
    self.pistonProcess = new engine.process({
	file:"./script/piston.js",
	arguments:[cylinder_short_id]
    });

    self.pistonProcess.process.stdout.on("data", function(data){
    	console.log("some shit", data.toString());
    });
    
    self.pistonProcess.process.stderr.on("data", function(data){
    	console.log(data.toString());
    });

    self.pistonTimeout = null;

    self.intake.on("message", function(data){
	var data = data.toString();
	intake_callback(data);

    	if (data == engine.constants.HANDSHAKE) {
	    // initialize connection to piston
	    console.log("compression handshake");
	    self.compression.send(engine.constants.HANDSHAKE);
    	    return true;
    	} else if (data == engine.constants.READY) {
	    console.log("compression ready");
    	    self.results_sender.send(engine.constants.READY);	    
	    return true;
	}
	
	self.ignite(data);
    });

    self.ignite = function(data){
	console.log("sending compression data");
    	self.compression.send(data);
	self.pistonTimeout = setTimeout(function(){
	    self.pistonProcess.kill();
	    self.pistonProcess = new engine.process({
		file:"./script/piston.js",
		arguments:[cylinder_short_id]
	    });
	    clearTimeout(self.pistonTimeout);
	}, compression_timeout);
    };
    
    self.compression.on("message", function(data){
	if (data.toString() == engine.constants.READY) {
	    self.results_sender.send(engine.constants.READY);
	    return true;
	}
	console.log("receiving compression output");
	clearTimeout(self.pistonTimeout);
	compression_callback(data);
	var parsed_data = JSON.parse(data.toString());
	parsed_data['output'] = self.pistonOutput;
    	self.results_sender.send(JSON.stringify(parsed_data));
    });
    
    // This is causing the spec to block. I suspect that its hanging on the missing endpoint
    //self.results_sender.send(engine.constants.HANDSHAKE);

    self.close = function(){
    	self.pistonProcess.kill();
    	self.intake.close();
    	self.results_sender.close();
    	self.compression.close();
    };
};

*/

exports.cylinder = cylinder;