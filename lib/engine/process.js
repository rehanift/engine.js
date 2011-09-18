var engine = function(){};
engine.util = require("./util");

/**
 * TODO: rename process => piston_process
 *   - Goal: provide an abstraction for node child processes
 */

/**
 * Constructor => Assignment only
 * .Make => Object Graph ==> Constructor (tested with 'friendlies')
 *   - Cannot call .Create for other Objects, only .Make
 * .Create => Instantiate Concrete Objects ==> .Make (not tested)
 * 
 */

var process = function(id, child_process, spawning_strategy){
    var self = this;
    self.id = id;
    self.child_process = child_process;
};

process.make = function(config){
    return new process(config.id, config.child_process);
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

    var child_process = spawn('node', [options.file].concat(options.arguments));

    child_process.on('exit', function(code, signal){
        console.log('CODE', code);
        console.log('SIGNAL', signal);
    });
    
    var new_process = process.make({
        id: id,
        child_process: child_process
    });
    
    return new_process;
};

process.prototype.kill = function(because){
    var self = this;
    var message = "Process ("+self.id+") is being killed";
    if (because) {
	console.log(because);
    }
    self.child_process.kill('SIGTERM');
};

exports.process = process;