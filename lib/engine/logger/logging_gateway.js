var logging_gateway = function(){
    this.logging_clients = [];
};

logging_gateway.prototype.add_logger = function(logger){
    this.logging_clients.push(logger);
};

logging_gateway.prototype.get_loggers = function(){
    return this.logging_clients;
};

logging_gateway.prototype.log_message = function(message){
    this.get_loggers().forEach(function(logger){
	logger.log(message);
    });
};

logging_gateway.make = function(){
    return new logging_gateway();
};

logging_gateway.create = function(){
    return logging_gateway.make();
};

exports.logging_gateway = logging_gateway;