var engine = function(){};
engine.process = require("./process").process;
engine.constants = require("./constants").constants;
engine.util = require("./util");
var executionWatcher = require("./executionWatcher").executionWatcher;

var cylinder = function(id, listening_socket, sending_socket, results_socket, exhaust_socket, 
                        execution_watcher, process_spawner) {
    var self = this;
    self.id = id;
    self.listening_socket = listening_socket;
    self.sending_socket = sending_socket;
    self.results_socket = results_socket;
    self.exhaust_socket = exhaust_socket;
    self.execution_watcher = execution_watcher;
    self.process_spawner = process_spawner;

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
                                    config.process_spawner);

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
        new_cylinder.exhaust_socket.send(data.toString());
        
        new_cylinder.send_next_task_or_clear();
    });
    
    new_cylinder.execution_watcher.on("kill", function(){
        var parsed_task = JSON.parse(new_cylinder.current_task);
        new_cylinder.exhaust_socket.send(JSON.stringify({
            task_id: parsed_task.task_id,
            last_eval: 'TimeoutError: Task took too long to complete'
        }));

        console.log("cylinder","stopping watcher");
        new_cylinder.execution_watcher.clear();
        
        console.log("cylinder","replacing piston process");
        var defunct_piston_process = new_cylinder.piston_process;

        defunct_piston_process.on('exit', function(){
            console.log("cylinder","creating new piston process");
            var new_piston_process = new_cylinder.process_spawner.spawn();
            new_cylinder.piston_process = new_piston_process;

            new_cylinder.send_next_task_or_clear();
        });

        console.log("cylinder","killing piston process");
        defunct_piston_process.kill('SIGKILL');

    });
    return new_cylinder;
};

cylinder.create = function(options){
    var id = engine.util.makeUUID({prefix:'cylinder'});

    var context = require("zmq");
    var listening_socket = context.createSocket("pull");
    listening_socket.connect("tcp://127.0.0.1:5557");

    var sending_socket = context.createSocket("push");
    sending_socket.bind("ipc://"+id+".ipc", function(err){
        if (err) throw err;
    });

    var results_socket = context.createSocket("pull");
    results_socket.bind("ipc://results-"+id+".ipc", function(err){
        if (err) throw err;
    });
    //sending_socket.connect("tcp://127.0.0.1:5559");

    var exhaust_socket = context.createSocket("push");
    exhaust_socket.connect("tcp://127.0.0.1:5558");

    var watcher = cylinder.executionWatcher.make({
        threshold: 5000
    });
    
    var process_spawner = require("./process_spawner").process_spawner;
    var spawner = process_spawner.create({
        file: "./script/piston.js",
        args: [id]
    });

    var new_cylinder = cylinder.make({
        id: id,
        listening_socket: listening_socket,
        sending_socket: sending_socket,
        results_socket: results_socket,
        exhaust_socket: exhaust_socket,
        execution_watcher: watcher,
        process_spawner: spawner
    });

    return new_cylinder;
};

cylinder.prototype.send_next_task_or_clear = function(){
    var self = this;
    if (self.pending_queue.length > 0) {
        self.current_task = self.pending_queue.shift();
        self.execution_watcher.start();
        self.sending_socket.send(self.current_task);
        console.log("cylinder sending next pending task", self.id, self.current_task.toString());
    } else {
        console.log("cylinder no pending tasks to send", self.id);
        self.current_task = null;
    }
};

cylinder.prototype.send_next_task_or_queue = function(data){
    var self = this;

    if (self.current_task != null) {
        console.log("cylinder adding task to pending queue", self.id, data.toString());
        self.pending_queue.push(data);
    } else {
        console.log("cylinder sending task to piston", self.id, data.toString());
        self.current_task = data;
        self.execution_watcher.start();
	self.sending_socket.send(data);
    }        
};


cylinder.prototype.close = function(){
    this.listening_socket.close();
    this.sending_socket.close();
    this.results_socket.close();
    this.exhaust_socket.close();
    this.piston_process.kill();
};

cylinder.executionWatcher = executionWatcher;

exports.cylinder = cylinder;