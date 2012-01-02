var cylinder_connection = require("./cylinder_connection").cylinder_connection,
    task_serializer = require("./task_serializer").task_serializer;

var cylinder_task_sender = function(connection, serializer){
    this.cylinder_connection = connection;
    this.task_serializer = serializer;
};

cylinder_task_sender.make = function(options){
    var new_sender = new cylinder_task_sender(options.cylinder_connection,
					      options.task_serializer);
    return new_sender;
};

cylinder_task_sender.create = function(config){
    var connection = cylinder_connection.create({
	sending_endpoint: config.sending_endpoint
    });
    var serializer = task_serializer.create();

    return cylinder_task_sender.make({
	cylinder_connection: connection,
	task_serializer: serializer
    });
};

cylinder_task_sender.prototype.send_task = function(task){
    var serialized_task = this.task_serializer.serialize(task);
    this.cylinder_connection.send(serialized_task);
};

cylinder_task_sender.prototype.close = function(task){
    this.cylinder_connection.close();
};

exports.cylinder_task_sender = cylinder_task_sender;