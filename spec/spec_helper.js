var util = require("util"),
    events = require("events"),
    engine = require("../engine").engine;

var mock = {};
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

mock.createClient = function(){
    var sending_socket = new mock.socket();
    var id = "1";
    var listening_endpoint = "ipc://crankshaft.ipc";
    
    return new engine.client(id, sending_socket, listening_endpoint);
};

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

var child_process = function(){};
child_process.prototype.kill = function(){};
child_process.prototype.restart = function(){};
mock.process = child_process;

var mock_sandbox_generator = function(){};
mock_sandbox_generator.prototype.generate = function(){};
mock.sandbox_generator = mock_sandbox_generator;

var mock_execution_strategy = function(){};
mock_execution_strategy.prototype.execute = function(){};
mock.execution_strategy = mock_execution_strategy;

var mock_execution_watcher = function(){};
mock_execution_watcher.prototype.start = function(){};
mock_execution_watcher.prototype.clear = function(){};
mock.execution_watcher = mock_execution_watcher;

exports.mock = mock;