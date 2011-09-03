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

mock.createTask = function(id, client){
    return new engine.task(id, client);
};

var child_process = function(){};
child_process.prototype.kill = function(){};
mock.process = child_process;

mock.createCylinder = function(){
    var listening_socket = new mock.socket();
    var piston_process = engine.process.create({
	id:"1",
	child_process_creator: function(){
	    return new mock.process();
	}
    }); 
    var cylinder = engine.cylinder.create({
	id: "1",
	listening_socket: listening_socket,
	sending_socket: new mock.socket(),
	piston_process: piston_process,
	execution_watcher: engine.cylinder.executionWatcher.create({
	    listening_socket: listening_socket,
	    threshold: 1000,
	    piston_process: piston_process
	})
    });
    return cylinder;
};

var mock_sandbox_generator = function(){};
mock_sandbox_generator.prototype.generate = function(){};
mock.sandbox_generator = mock_sandbox_generator;

var mock_execution_strategy = function(){};
mock_execution_strategy.prototype.execute = function(){};
mock.execution_strategy = mock_execution_strategy;

exports.mock = mock;