var loggable = function(){
    this.find_or_create_logging_gateway = function(options){
	if (typeof options != "undefined" && typeof options.logging_gateway != "undefined") {
	    return options.logging_gateway;
	} else {
	    var logging_gateway = require("../engine/logger/logging_gateway").logging_gateway;
	    return logging_gateway.create();
	}
    };
};

exports.loggable = loggable;