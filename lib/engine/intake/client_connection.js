var events = require('events'),
    util = require('util'),
    zmq = require('zmq');

var client_connection = function(socket){
    this.socket = socket;
};
util.inherits(client_connection,events.EventEmitter);

client_connection.make = function(options){
    var connection = new client_connection(options.socket);

    options.socket.on("message", function(message){
	connection.emit("task", message.toString());
    });

    return connection;
};

client_connection.create = function(config){
    var socket = zmq.createSocket('pull');
    socket.bindSync(config.listening_endpoint);

    return client_connection.make({
	socket: socket
    });
};

client_connection.prototype.close = function(){
    this.socket.close();
};

exports.client_connection = client_connection;