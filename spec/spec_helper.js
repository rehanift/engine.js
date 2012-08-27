var util = require("util"),
    events = require("events"),
    engine = require("../engine").engine;

var mock = {};
var cf = require("./helpers/component_factories").helpers;

mock.TASK_PAYLOAD = JSON.stringify({
    task_id: "1",
    context: "",
    code: "",
    locals: {}
});


mock.TASK_RESULTS = JSON.stringify({
    task_id: "1",
    response: { evaluation: "" }
});


var mock_client = function(){};
mock_client.prototype.run = function(){};
mock.client = mock_client;


var mockSocket = function(){};
util.inherits(mockSocket, events.EventEmitter);
mockSocket.prototype.close = function(){};
mockSocket.prototype.send = function(){};
mockSocket.prototype.connect = function(){};
mockSocket.prototype.subscribe = function(){};
mockSocket.prototype.unsubscribe = function(){};
mockSocket.prototype.bind = function(endpoint, callback){
    setTimeout(callback, 500);
};
mockSocket.prototype.bindSync = function(endpoint){};

mockSocket.prototype.fakeSend = function(message){
    this.emit("message", message);
};

mock.socket = mockSocket;

var mock_task = function(){
    this.id = Math.floor(Math.random() * 100);
};
mock_task.prototype.getContext = function(){};
mock_task.prototype.getLocals = function(){};
mock_task.prototype.getCode = function(){};
mock_task.prototype.on = function(){};
mock_task.prototype.emit = function(){};
mock.task = mock_task;

mock.TaskResponseTranslator = (function(){
    var translator = function(){};
    translator.prototype = {
	translate: function(){}
    };

    return translator;
})();

var stdout = function(){};
util.inherits(stdout, events.EventEmitter);
var stderr = function(){};
util.inherits(stderr, events.EventEmitter);

var child_process = function(){
    this.stdout = stdout;
    this.stderr = stderr;
};
util.inherits(child_process, events.EventEmitter);

child_process.prototype.kill = function(){};
mock.process = child_process;

var mock_sandbox_generator = function(){};
mock_sandbox_generator.prototype.generate = function(){};
mock.sandbox_generator = mock_sandbox_generator;

var mock_execution_strategy = function(){};
util.inherits(mock_execution_strategy, events.EventEmitter);
mock_execution_strategy.prototype.execute = function(){};
mock.execution_strategy = mock_execution_strategy;

var mock_execution_watcher = function(){
    this.piston_process = new mock.process();
};
util.inherits(mock_execution_watcher, events.EventEmitter);
mock_execution_watcher.prototype.start = function(){};
mock_execution_watcher.prototype.clear = function(){};
mock.execution_watcher = mock_execution_watcher;

var mock_piston_server = function(){};
mock_piston_server.prototype.accept_request = function(){};
mock_piston_server.prototype.send_response = function(){};
mock_piston_server.prototype.close = function(){};
mock.piston_server = mock_piston_server;

var mock_logging_gateway = function(){};
mock_logging_gateway.prototype.log_message = function(){};
mock_logging_gateway.prototype.log = function(){};
mock.logging_gateway = mock_logging_gateway;

var mock_logging_client = function(){};
mock_logging_client.prototype.log = function(){};
mock.logging_client = mock_logging_client;

mock.log_message = function(){};

var mock_log_formatter = function(){};
mock_log_formatter.prototype.format = function(){};
mock.log_formatter = mock_log_formatter;

var mock_log_writer = function(){};
mock_log_writer.prototype.write = function(){};
mock.log_writer = mock_log_writer;

var mock_context_validator = function(){};
mock_context_validator.prototype.validate = function(){};
mock.context_validator = mock_context_validator;

mock.async_callback_register = (function(){
    var klass = function(){};
    util.inherits(klass, events.EventEmitter);

    klass.prototype.start = function(){};
    klass.prototype.end = function(){};
    klass.prototype.finish = function(){};

    return klass;
})();


mock.PistonProcessSpawner = (function(){
  var klass = function(){};
  
  klass.prototype.spawn_new_process = function(){};

  return klass;
})();

mock.PistonProcessWatcher = (function(){
  var klass = function(){};
  util.inherits(klass, events.EventEmitter);

  klass.prototype.start_watching = function(){};
  klass.prototype.stop_watching = function(){};

  return klass;
})();

mock.LoggingGateway = (function(){
  var klass = function(){};

  klass.prototype.log = function(){};

  return klass;
})();

mock.PistonProcess = (function(){
  var klass = function(){};
  util.inherits(klass, events.EventEmitter);  

  klass.prototype.terminate = function(){};
  klass.prototype.kill = function(){};

  return klass;
})();

mock.PistonProcessManager = (function(){
  var klass = function(){};
  util.inherits(klass, events.EventEmitter);  

  klass.prototype.start_new_process = function(){};
  klass.prototype.terminate_current_process = function(){};
  klass.prototype.kill_current_process = function(){};
  klass.prototype.get_current_process = function(){};
  klass.prototype.set_current_process = function(){};

  return klass;
})();

mock.ExhaustTaskResponseSender = (function(){
  var klass = function(){};

  klass.prototype.send_execution_error = function(){};
  klass.prototype.close = function(){};

  return klass;
})();

mock.TaskResponseSerializer = (function(){
  var klass = function(){};

  klass.prototype.serialize = function(){};

  return klass;
})();

mock.OutboundExhaustConnection = (function(){
  var klass = function(){};

  klass.prototype.send_response = function(){};
  klass.prototype.close = function(){};

  return klass;
})();

exports.mock = mock;

exports.component_factories = cf;
