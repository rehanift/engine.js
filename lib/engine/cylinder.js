var util = require("./util"),
    execution_watcher = require("./cylinder/execution_watcher").execution_watcher,
    log_message = require("./logger/log_message").log_message,
    logging_gateway = require("./logger/logging_gateway").logging_gateway;

var cylinder = function(id, listening_socket, exhaust_socket, 
                        execution_watcher, logging_gateway, context_validator,
                        piston_process_manager, task_response_sender) {
  var self = this;
  self.id = id;
  self.listening_socket = listening_socket;
  self.exhaust_socket = exhaust_socket;
  self.execution_watcher = execution_watcher;
  self.logging_gateway = logging_gateway;
  self.context_validator = context_validator;
  self.piston_process_manager = piston_process_manager;
  self.task_response_sender = task_response_sender;

  self.current_tasks = [];
  self.pending_queue = [];
  self.current_task = null;
};

cylinder.make = function(config){
  var new_cylinder = new cylinder(config.id,
				  config.listening_socket,
				  config.exhaust_socket,
				  config.execution_watcher,
				  config.logging_gateway,
				  config.context_validator,
                                  config.piston_process_manager,
                                  config.task_response_sender);

  new_cylinder.logging_gateway.log({component: "Cylinder", action: "Created"});

  new_cylinder.piston_process_manager.start_new_process();
    
  new_cylinder.listening_socket.on("message", function(data){
    var parsed_data = JSON.parse(data.toString());
    if (new_cylinder.context_validator.validate(parsed_data.context, parsed_data.locals) == false) {
      new_cylinder.task_response_sender.send_execution_error(parsed_data.task_id, 
                                                             "SandboxError: There was a problem "
                                                             + "with your task's context");
    } else {	
      new_cylinder.send_next_task_or_queue(data.toString());
    }
  });

  //new_cylinder.results_socket.on("message", function(data){
  //  new_cylinder.execution_watcher.clear();
  //  var parsed_data = JSON.parse(data.toString());
  //  new_cylinder.logging_gateway.log({
  //    task_id: parsed_data.task_id,
  //    component: "Cylinder",
  //    action: "Sending Task results to Exhaust"
  //  });
  //  
  //  new_cylinder.exhaust_socket.send(data.toString());
  //  
  //  new_cylinder.send_next_task_or_clear();
  //});

  new_cylinder.piston_process_manager.on("task response", function(data){
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


  new_cylinder.piston_process_manager.on("piston restart", function(){
    new_cylinder.send_next_task_or_clear();
  });

  new_cylinder.piston_process_manager.on("piston crash", function(code,signal){
    new_cylinder.execution_watcher.clear();
    var current_task = new_cylinder.get_current_task();

    current_task = JSON.parse(current_task);

    new_cylinder.logging_gateway.log({
      task_id: current_task.task_id,
      component: "Piston",
      action: "Crashed during task execution with code:" + code + " and signal:" + signal
    });

    new_cylinder.task_response_sender.send_execution_error(current_task.task_id, 
                                                           "UnexpectedError: An unexpected error "
                                                           + "occurred while executing your task.");

    new_cylinder.send_next_task_or_clear();
  });
  
  new_cylinder.execution_watcher.on("kill", function(){
    var parsed_task = JSON.parse(new_cylinder.get_current_task());
    new_cylinder.exhaust_socket.send(JSON.stringify({
      task_id: parsed_task.task_id,
      error: 'TimeoutError: Task took too long to complete'
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

    new_cylinder.piston_process_manager.kill_current_process();
  });
  return new_cylinder;
};

cylinder.create = function(config){
  var path = require("path");

  var provide_defaults = require("./helpers/provide_defaults");
  var options = provide_defaults(config,{
    listening_endpoint: "ipc:///tmp/cylinder-listener.ipc",
    exhaust_endpoint: "ipc:///tmp/exhaust-listener.ipc",
    piston_script: __dirname + "/../../script/piston.js",
    threshold: 5000,
    logging_gateway: logging_gateway.create(),
    run_as_user: process.getuid(),
    run_as_group: process.getgid()
  });

  var id = util.makeUUID({prefix:'cylinder'});

  var context = require("zmq");
  var listening_socket = context.socket("pull");
  listening_socket.connect(options.listening_endpoint);

  var results_socket = context.socket("pull");
  results_socket.bindSync("ipc:///tmp/results-"+id+".ipc", function(err){
    if (err) throw err;
  });

  var exhaust_socket = context.socket("push");
  exhaust_socket.connect(options.exhaust_endpoint);

  var task_response_sender = require("./cylinder/exhaust_task_response_sender").create({
    exhaust_endpoint: options.exhaust_endpoint
  });

  var watcher = cylinder.execution_watcher.make({
    threshold: options.threshold
  });
  
  var piston_process_manager = require("./cylinder/piston_process_manager").create({
    logging_gateway: options.logging_gateway,
    piston_script: options.piston_script,
    script_args: [id, options.exhaust_endpoint],
    run_as_user: options.run_as_user,
    run_as_group: options.run_as_group
  });

  var context_validator = require("./cylinder/context_validator").context_validator;
  var validator = context_validator.create();

  var new_cylinder = cylinder.make({
    id: id,
    listening_socket: listening_socket,
    exhaust_socket: exhaust_socket,
    execution_watcher: watcher,
    logging_gateway: options.logging_gateway,
    context_validator: validator,
    piston_process_manager: piston_process_manager,
    task_response_sender: task_response_sender
  });

  return new_cylinder;
};

cylinder.prototype.send_next_task_or_clear = function(){
  var self = this;
  if (self.pending_queue.length > 0) {
    self.set_current_task(self.pending_queue.shift());
    var parsed_task = JSON.parse(self.get_current_task());
    self.execution_watcher.start();
    self.piston_process_manager.send_task_to_piston(self.get_current_task());
    self.logging_gateway.log({
      task_id: parsed_task.task_id,
      component: "Cylinder",
      action: "Sending next pending task to Piston"
    });
  } else {
    self.logging_gateway.log({
      component: "Cylinder",
      action: "Tried to send next pending task to Piston but there are none"
    });
    self.set_current_task(null);
  }
};

cylinder.prototype.send_next_task_or_queue = function(data){
  var self = this;

  var task = JSON.parse(data.toString());

  if (self.get_current_task() != null) {
    self.logging_gateway.log({
      task_id: task.task_id,
      component: "Cylinder",
      action: "Adding task to pending queue"
    });
    self.pending_queue.push(data);
  } else {
    self.set_current_task(data);
    self.logging_gateway.log({
      task_id: task.task_id,
      component: "Cylinder",
      action: "Sending task to Piston"
    });
    self.execution_watcher.start();
    self.piston_process_manager.send_task_to_piston(data);
  }        
};

cylinder.prototype.get_current_task = function(){ return this.current_task; };
cylinder.prototype.set_current_task = function(task){ this.current_task = task;};


cylinder.prototype.close = function(){
  this.logging_gateway.log({
    component: "Cylinder",
    action: "Closing"
  });
  this.listening_socket.close();
  this.exhaust_socket.close();
  this.task_response_sender.close();
  this.piston_process_manager.terminate_current_process();
};

cylinder.execution_watcher = execution_watcher;

exports.cylinder = cylinder;
