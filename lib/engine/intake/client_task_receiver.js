var events = require('events'),
    util = require('util'),
    client_connection = require('./client_connection').client_connection,
    task_translator = require('./task_translator').task_translator;

var receiver = function(connection, translator){
    this.connection = connection;
    this.translator = translator;
};
util.inherits(receiver, events.EventEmitter);

receiver.make = function(options){
    var new_receiver = new receiver(options.client_connection, 
				    options.task_translator);

    options.client_connection.on("task", function(raw_task){
	var task = options.task_translator.translate(raw_task);
	new_receiver.emit("task", task);
    });

    return new_receiver;
};

receiver.create = function(config){
    var connection = client_connection.create({
	listening_endpoint: config.listening_endpoint
    });

    var translator = task_translator.create();

    return receiver.make({
	client_connection: connection,
	task_translator: translator
    });
};

receiver.prototype.close = function(){
    this.connection.close();
};

exports.client_task_receiver = receiver;