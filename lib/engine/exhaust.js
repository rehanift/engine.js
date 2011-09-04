var exhaust = function(listening_socket, publishing_socket){
    this.listening_socket = listening_socket;
    this.publishing_socket = publishing_socket;
};
exhaust.make = function(options){
    var new_exhaust = new exhaust(options.listening_socket, 
                                  options.publishing_socket);

    new_exhaust.listening_socket.on("message", function(data){
        console.log("exhaust", data.toString());
        var payload = JSON.parse(data);    
        var task_id = payload['task_id'];
        new_exhaust.publishing_socket.send(task_id + " " + data);
    });

    return new_exhaust;
};

exhaust.create = function(options){
    var context = require("zeromq");
    var listening_socket = context.createSocket("pull");
    listening_socket.bind("ipc://exhaust_collector.ipc", function(err){
        if (err) throw err;
    });

    var publishing_socket = context.createSocket("publisher");
    publishing_socket.bind("ipc://exhaust_publisher.ipc", function(err){
        if (err) throw err;
    });

    return exhaust.make({
        listening_socket: listening_socket,
        publishing_socket: publishing_socket
    });
};

exhaust.prototype.close = function(){
    this.listening_socket.close();
    this.publishing_socket.close();
};

exports.exhaust = exhaust;