var engine = function(){};
engine.util = require("./util");

var vm = require("vm");

var piston = function(options){
    var self = this;

    self.id = engine.util.makeUUID({prefix: "piston"});
    
    process.on('SIGINT', function() {
        self.code_responder.close();
    });

    self.server = new piston.server();
};

piston.fire = function(data){
    var config = JSON.parse(data);
    var code = config['code'];
    var context = config['context'];
    var locals = config['locals'];
    
    var sandbox = (eval(context))(locals);
    
    var returned_data;
    var results = (function(code) {
	try {
	    returned_data = vm.runInNewContext(this.toString(), sandbox);
	}
	catch (e) {
	    returned_data =  e.name + ': ' + e.message;
	}
	
	return [returned_data, context];
    }).call(code);
    
    return {
    	returned_data: results[0],
    	context: results[1]
    };
};

piston.server = function(){
    var self = this;
    self.started = false;
    self.running = function(){
	return self.started;
    };

    var context = require('zeromq');
    self.code_responder = context.createSocket('rep');

    self.code_responder.on('message', function(data) {
        var response = piston.fire(data);
	self.code_responder.send(JSON.stringify(response));		
	
	return true;
    });

    self.start = function(endpoint, callback){
	self.code_responder.bind(endpoint, function(err) {
            if(err) {
		console.log(err);
            } else {
		self.started = true;
		if (typeof callback != "undefined") {
		    callback.call();
		}
	    }
	});  
    };

    self.stop = function(callback){
	self.code_responder.close();
	self.started = false;
	if (typeof callback != "undefined") {
	    callback.call();
	}
    };

    self.getSockets = function(){
        return [self.code_responder];
    };    

};

exports.piston = piston;