var engine = function(){};
engine.util = require("./util");

var process = function(id, child_process_creator){
    var self = this;
    self.id = id;
    self.child_process_creator = child_process_creator;
    self.process = self.child_process_creator.call();
};

process.make = function(config){
    //var id = engine.util.makeUUID({prefix:"process"});
    

    //var child_process = spawn('node', [options.file].concat(options.arguments));
    return new process(config.id, config.child_process_creator);
};

process.create = function(options){
    var spawn = require("child_process").spawn,
        path = require("path");
    
    if (typeof options.file == "undefined") {
    	throw "The name of a file is needed to spawn a new process";
    }
    if (path.exists(options.file)) {
    	throw "The file at '"+options.file+"' does not exist";
    }
    
    var id = engine.util.makeUUID({prefix:"process"});
    var process_builder = function(){
        var child_process = spawn('node', [options.file].concat(options.arguments));
        child_process.on('exit', function(code, signal){
            console.log('CODE', code);
            console.log('SIGNAL', signal);
        });
        return child_process;
    };
    
    var new_process = process.make({
        id: id,
        child_process_creator: process_builder
    });

    return new_process;
};

process.prototype.kill = function(because){
    var self = this;
    var message = "Process ("+self.id+") is being killed";
    if (because) {
	console.log(because);
    }
    self.process.kill('SIGTERM');
};

process.prototype.restart = function(){
    var self = this;
    self.process = self.child_process_creator.call();
};

exports.process = process;