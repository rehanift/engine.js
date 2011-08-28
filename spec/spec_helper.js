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

mock.createIntake = function(){
    var listening_socket = new mock.socket();    
    var sending_socket = new mock.socket();    
    var intake = new engine.intake(listening_socket, sending_socket);    

    intake.initialize_sockets({
	listening_endpoit: "foo",
	sending_endpoint: "bar"
    });

    return intake;
};

exports.mock = mock;