var zmq = require('zmq');

var cylinder_connection = function(socket){
    this.socket = socket;
};

cylinder_connection.make = function(options){
    var connection = new cylinder_connection(options.socket);

    return connection;
};

cylinder_connection.create = function(config){
    var socket = zmq.createSocket('push');
    socket.bindSync(config.sending_endpoint);
    
    return cylinder_connection.make({
    	socket: socket
    });
};

cylinder_connection.prototype.send = function(serialized_task){
    this.socket.send(serialized_task);
};

cylinder_connection.prototype.close = function(){
    this.socket.close();
};

exports.cylinder_connection = cylinder_connection;