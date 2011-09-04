var exhaust = function(listening_socket, publishing_socket){
    this.listening_socket = listening_socket;
    this.publishing_socket = publishing_socket;
};
exhaust.make = function(options){
    var new_exhaust = new exhaust(options.listening_socket, 
                                  options.publishing_socket);

    new_exhaust.listening_socket.on("message", function(data){
        var payload = JSON.parse(data);    
        var task_id = payload['task_id'];
        new_exhaust.publishing_socket.send(task_id + " " + data);
    });

    return new_exhaust;
};

exports.exhaust = exhaust;