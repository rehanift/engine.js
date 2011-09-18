var engine = function(){};
engine.constants = require("./constants").constants;

var piston_server = function(piston, socket, result_socket, watcher_socket){    
    this.socket = socket;
    this.piston = piston;
    this.result_socket = result_socket;
};

piston_server.make = function(options){
    var server = new piston_server(options.piston,
                                   options.socket,
                                   options.result_socket);
    
    server.socket.on("message", function(data){
        console.log("piston server", data.toString());
        console.log("piston server - starting task execution");
        server.accept_request(data);
    });

    return server;
};

piston_server.prototype.accept_request = function(data){
    var response = this.piston.process_request(data);
    console.log(response);
    this.send_response(response);
};

piston_server.prototype.send_response = function(data){
    console.log("piston server", data.toString());
    this.result_socket.send(data.toString());
};

piston_server.prototype.close = function(){
    this.socket.close();
    this.result_socket.close();
};

exports.pistonServer = piston_server;