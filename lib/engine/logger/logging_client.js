var logging_client = function(formatter, writer){
    this.formatter = formatter;
    this.writer = writer;
};

logging_client.prototype.log = function(message){
    var formatted_message = this.formatter.format(message);
    this.writer.write(formatted_message);
};

logging_client.make = function(config){
    return new logging_client(config.formatter,
			      config.writer);
};

logging_client.create = function(){};

exports.logging_client = logging_client;