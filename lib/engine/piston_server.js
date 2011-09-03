var piston_server = function(piston, socket){    
    this.socket = socket;
    this.piston = piston;
};

piston_server.make = function(options){
    var server = new piston_server(options.piston,
                                   options.socket);
    server.socket.on("message", function(data){
        server.accept_request(data);
    });

    return server;
};

piston_server.prototype.accept_request = function(data){
    var response = this.piston.process_request(data);
    this.send_response(response);
};

piston_server.prototype.send_response = function(data){
    this.socket.send(data);
};

exports.pistonServer = piston_server;