var util = require("util"),
    events = require("events"),
    engine = require("../engine").engine;

var mock = {};

mock.TASK_PAYLOAD = JSON.stringify({
    task_id: "1",
    context: "",
    code: "",
    locals: {}
});

mock.TASK_RESULTS = JSON.stringify({
    task_id: "1",
    last_eval: ""
});


mock.crankshaft = function(endpoint){
    var context = require("zeromq");
    var mockCrankshaft = context.createSocket("push");
    mockCrankshaft.connect(endpoint);

    return mockCrankshaft;
};

mock.cylinder_block = function(endpoint){
    var context = require("zeromq");
    var mockCylinderBlock = context.createSocket("pull");
    mockCylinderBlock.connect(endpoint);

    return mockCylinderBlock;
};

mock.intake_manifold = function(endpoint, callback){
    var context = require("zeromq");
    var mock = context.createSocket("pull");
    mock.bind(endpoint, function(err){
	if (err) throw err;
	if (typeof callback != "undefined") callback();
    });

    return mock;
};


var mock_client = function(){};
mock_client.prototype.run = function(){};
mock.client = mock_client;


var mockSocket = function(){};
util.inherits(mockSocket, events.EventEmitter);
mockSocket.prototype.close = function(){};
mockSocket.prototype.send = function(){};
mockSocket.prototype.connect = function(){};
mockSocket.prototype.bind = function(endpoint, callback){
    setTimeout(callback, 500);
};
mockSocket.prototype.fakeSend = function(message){
    this.emit("message", message);
};

mock.socket = mockSocket;

var mock_task = function(){};
mock_task.prototype.getContext = function(){};
mock_task.prototype.getLocals = function(){};
mock_task.prototype.getCode = function(){};
mock.task = mock_task;

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

var spawner = function(){};
spawner.prototype.spawn = function(){
    return new mock.process();
};
mock.process_spawner = spawner;

var mock_sandbox_generator = function(){};
mock_sandbox_generator.prototype.generate = function(){};
mock.sandbox_generator = mock_sandbox_generator;

var mock_execution_strategy = function(){};
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

var mock_logging_client = function(){};
mock_logging_client.prototype.log = function(){};
mock.logging_client = mock_logging_client;

mock.log_message = function(){};

exports.mock = mock;