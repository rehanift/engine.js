var engine_util = require("./util"),
    task = require("./client/task").task,
    TaskResponse = require('./client/task/response').TaskResponse;

var EventEmitter = require("events").EventEmitter,
    util = require("util");

var client = function(id, sending_socket, listening_socket, 
                      task_creation_strategy, task_response_translator){
  var self = this;
  self.id = id;
  self.sending_socket = sending_socket;
  self.listening_socket = listening_socket;
  self.task_creation_strategy = task_creation_strategy;
  self.tasks = {};
  self.task_response_translator = task_response_translator;
};

client.make = function(options){
  var new_client = new client(options.id,
                              options.sending_socket,
                              options.listening_socket,
                              options.task_creation_strategy,
                              options.task_response_translator);

  new_client.listening_socket.on("message", function(data){
    var task_response = new_client.task_response_translator.translate(data.toString());
    var task = new_client.find_task_by_id(task_response.getTaskId());

    if (task_response.isExecutionError()) {      
      new_client.listening_socket.unsubscribe(task_response.getTaskId());
      task.emit("eval", task_response.getExecutionError(), null);
    }  else {
      new_client.listening_socket.unsubscribe(task_response.getTaskId());
      task.emit("eval", null, task_response);
    }
  });

  return new_client;
};

client.create = function(config){
  var provide_defaults = require("./helpers/provide_defaults");

  var options = provide_defaults(config,{
    sending_endpoint: "ipc:///tmp/intake-listener.ipc",
    listening_endpoint: "ipc:///tmp/exhaust-publisher.ipc"
  });

  var context = require("zmq");
  var sending_socket = context.socket("push");
  sending_socket.connect(options.sending_endpoint);

  var listening_socket = context.socket('sub');
  listening_socket.connect(options.listening_endpoint);

  var task_creation_strategy = function(client){
    return task.create({
      client: client,
      listening_endpoint: options.listening_endpoint
    });
  };

  var translator = require("./client/task/task_response_translator").TaskResponseTranslator;

  return client.make({
    id: engine_util.makeUUID({prefix:"client"}),
    sending_socket: sending_socket,
    listening_socket: listening_socket,
    task_creation_strategy: task_creation_strategy,
    task_response_translator: translator.create()
  });    
};

client.prototype.createTask = function(){
  var task = this.createTaskFromStrategy(this);
  this.listening_socket.subscribe(task.id);
  this.tasks[task.id] = task;
  return task;
};

client.prototype.createTaskFromStrategy = function(client){
  return this.task_creation_strategy.call(null, client);
};

client.prototype.run = function(task){
  var self = this;
  
  var data = {
    task_id: task.id,
    context: task.getContext(),
    locals: task.getLocals(),
    code: task.getCode()
  };

  // TODO: push seritalization into its own strategy
  self.sending_socket.send(JSON.stringify(data));
};

client.prototype.find_task_by_id = function(task_id){
  return this.tasks[task_id];
};

client.prototype.close = function(){
  var self = this;
  self.sending_socket.close();
  self.listening_socket.close();
};

exports.client = client;
