var util = require("./util"),
    execution_watcher = require("./cylinder/execution_watcher").execution_watcher,
    log_message = require("./logger/log_message").log_message,
    logging_gateway = require("./logger/logging_gateway").logging_gateway;

var cylinder = function(id, listening_socket, sending_socket, results_socket, exhaust_socket, 
                        execution_watcher, process_spawner, logging_gateway) {
    var self = this;
    self.id = id;
    self.listening_socket = listening_socket;
    self.sending_socket = sending_socket;
    self.results_socket = results_socket;
    self.exhaust_socket = exhaust_socket;
    self.execution_watcher = execution_watcher;
    self.process_spawner = process_spawner;
    self.logging_gateway = logging_gateway;

    self.current_tasks = [];
    self.pending_queue = [];
    self.current_task = null;
};

cylinder.make = function(config){
    var new_cylinder = new cylinder(config.id,
				    config.listening_socket,
				    config.sending_socket,
                                    config.results_socket,
				    config.exhaust_socket,
				    config.execution_watcher,
                                    config.process_spawner,
				    config.logging_gateway);

    new_cylinder.logging_gateway.log({component: "Cylinder", action: "Created"});

    new_cylinder.piston_process = new_cylinder.process_spawner.spawn();
    
    //new_cylinder.piston_process.stdout.on("data", function(data) {
    //    console.log("piston process stdout (2)",data.toString());
    //});
    //
    //new_cylinder.piston_process.stderr.on("data", function(data) {
    //    console.log("piston process stderr",data.toString());
    //});
    
    new_cylinder.listening_socket.on("message", function(data){
        new_cylinder.send_next_task_or_queue(data);
    });

    new_cylinder.results_socket.on("message", function(data){
        new_cylinder.execution_watcher.clear();
	var parsed_data = JSON.parse(data.toString());
	new_cylinder.logging_gateway.log({
	    task_id: parsed_data.task_id,
	    component: "Cylinder",
	    action: "Sending Task results to Exhaust"
	});
        new_cylinder.exhaust_socket.send(data.toString());
        
        new_cylinder.send_next_task_or_clear();
    });
    
    new_cylinder.execution_watcher.on("kill", function(){
        var parsed_task = JSON.parse(new_cylinder.current_task);
        new_cylinder.exhaust_socket.send(JSON.stringify({
            task_id: parsed_task.task_id,
            last_eval: 'TimeoutError: Task took too long to complete'
        }));

	new_cylinder.logging_gateway.log({
	    task_id: parsed_task.task_id,
	    component: "Cylinder",
	    action: "Stopping process watcher"
	});
        new_cylinder.execution_watcher.clear();
        
	new_cylinder.logging_gateway.log({
	    task_id: parsed_task.task_id,
	    component: "Cylinder",
	    action: "Replacing Piston process"
	});
        var defunct_piston_process = new_cylinder.piston_process;

        defunct_piston_process.on('exit', function(){
	    new_cylinder.logging_gateway.log({
		task_id: parsed_task.task_id,
		component: "Cylinder",
		action: "Creating new Piston process"
	    });
            var new_piston_process = new_cylinder.process_spawner.spawn();
            new_cylinder.piston_process = new_piston_process;

            new_cylinder.send_next_task_or_clear();
        });

	new_cylinder.logging_gateway.log({
	    task_id: parsed_task.task_id,
	    component: "Cylinder",
	    action: "Killing Piston Process"
	});
        defunct_piston_process.kill('SIGKILL');

    });
    return new_cylinder;
};

cylinder.create = function(config){

    var path = require("path");
    var piston_script;
    if (config && typeof config.piston_script == "undefined") {
	piston_script = path.dirname(require.resolve("engine.js")) + "/script/piston.js";
    }

    var provide_defaults = require("./helpers/provide_defaults");
    var options = provide_defaults(config,{
	listening_endpoint: "ipc://cylinder-listener.ipc",
	exhaust_endpoint: "ipc://exhaust-listener.ipc",
	piston_script: piston_script,
        threshold: 5000,
	logging_gateway: logging_gateway.create()
    });

    var id = util.makeUUID({prefix:'cylinder'});

    var context = require("zmq");
    var listening_socket = context.createSocket("pull");
    listening_socket.connect(options.listening_endpoint);

    var sending_socket = context.createSocket("push");
    sending_socket.bind("ipc://"+id+".ipc", function(err){
        if (err) throw err;
    });

    var results_socket = context.createSocket("pull");
    results_socket.bind("ipc://results-"+id+".ipc", function(err){
        if (err) throw err;
    });

    var exhaust_socket = context.createSocket("push");
    exhaust_socket.connect(options.exhaust_endpoint);

    var watcher = cylinder.execution_watcher.make({
	threshold: options.threshold
    });
    
    var process_spawner = require("./cylinder/process_spawner").process_spawner;
    var spawner = process_spawner.create({
        file: options.piston_script,
        args: [id, options.exhaust_endpoint]
    });

    var new_cylinder = cylinder.make({
        id: id,
        listening_socket: listening_socket,
        sending_socket: sending_socket,
        results_socket: results_socket,
        exhaust_socket: exhaust_socket,
        execution_watcher: watcher,
        process_spawner: spawner,
	logging_gateway: options.logging_gateway
    });

    return new_cylinder;
};

cylinder.prototype.send_next_task_or_clear = function(){
    var self = this;
    if (self.pending_queue.length > 0) {
        self.current_task = self.pending_queue.shift();
        self.execution_watcher.start();
        self.sending_socket.send(self.current_task);
	self.logging_gateway.log({
	    task_id: self.current_task.task_id,
	    component: "Cylinder",
	    action: "Sending next pending task to Piston"
	});
    } else {
	self.logging_gateway.log({
	    component: "Cylinder",
	    action: "Tried to send next pending task to Piston but there are none"
	});
        self.current_task = null;
    }
};

cylinder.prototype.send_next_task_or_queue = function(data){
    var self = this;

    if (self.current_task != null) {
	self.logging_gateway.log({
	    task_id: self.current_task.task_id,
	    component: "Cylinder",
	    action: "Adding task to pending queue"
	});
        self.pending_queue.push(data);
    } else {
        self.current_task = data;
	self.logging_gateway.log({
	    task_id: self.current_task.task_id,
	    component: "Cylinder",
	    action: "Sending task to Piston"
	});
        self.execution_watcher.start();
	self.sending_socket.send(data);
    }        
};


cylinder.prototype.close = function(){
    this.logging_gateway.log({
	component: "Cylinder",
	action: "Closing"
    });
    this.listening_socket.close();
    this.sending_socket.close();
    this.results_socket.close();
    this.exhaust_socket.close();
    this.piston_process.kill();
};

cylinder.execution_watcher = execution_watcher;

exports.cylinder = cylinder;