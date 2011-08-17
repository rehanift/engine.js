var engine = function(){};
engine.util = require("./util");
engine.constants = require("./constants").constants;

var vm = require("vm");

var piston = function(options){
    var self = this;

    self.id = engine.util.makeUUID({prefix: "piston"});
    
    //process.on('SIGINT', function() {
    //    self.code_responder.close();
    //});

    self.server = new piston.server(self);
};

piston.prototype.makeSandbox = function(data){
    var self = this;
    var ctx = require("zeromq");
    self.logger = ctx.createSocket("push");
    self.logger.connect("ipc://logger.ipc");
    
    var config = JSON.parse(data);
    var context = config['context'];
    var locals = config['locals'];

    var sandbox = (eval(context))(locals);

    var consolex = {
	log: function(){
	    var i, l;
	    var util = require('util');
	    for ( i = 0, l = arguments.length; i < l; i++ ) {
		self.logger.send(util.inspect(arguments[i]));
	    }	    
	}
    };
    
    sandbox.console = consolex;

    return sandbox;
};

piston.fire = function(data, sandbox){
    var config = JSON.parse(data);
    var code = config['code'];
    var running_task_id = config['running_task_id'];
    
    var last_exp_eval;
    var results = (function(code) {
	try {
	    last_exp_eval = vm.runInNewContext(this.toString(), sandbox);
	}
	catch (e) {
	    last_exp_eval =  e.name + ': ' + e.message;
	}
	
	return [last_exp_eval, sandbox];
    }).call(code);
    
    return {
    	last_exp_eval: results[0],
    	modified_context: results[1],
	running_task_id: running_task_id
    };
};

piston.server = function(instance){
    var self = this;
    self.started = false;
    self.running = function(){
	return self.started;
    };

    self.instance = instance;

    var context = require('zeromq');
    self.code_responder = context.createSocket('rep');

    self.code_responder.on('message', function(data) {	
	var data = data.toString();
	console.log("code responder:",data);
	console.log("code responder:",engine.constants.HANDSHAKE);
	if (data == engine.constants.HANDSHAKE) {
	    console.log("code responder handshake");
	    self.code_responder.send(engine.constants.READY);
	    console.log("code responder ready");
	    return true;
	}

	var sandbox = self.instance.makeSandbox(data);
        var response = piston.fire(data, sandbox);
	self.code_responder.send(JSON.stringify(response));		
	
	return true;
    });

    self.start = function(endpoint, callback){
	self.code_responder.bind(endpoint, function(err) {
            if(err) {
		console.log(err);
            } else {
		console.log("connected to:",endpoint);
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