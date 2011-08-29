var engine = function(){};
engine.util = require("./util");

var spawn = require("child_process").spawn,
    path = require("path");

var process = function(id, child_process_creator){
    var self = this;
    self.id = id;
    self.child_process_creator = child_process_creator;
    self.process = self.child_process_creator.call();
};

process.create = function(config){
    //var id = engine.util.makeUUID({prefix:"process"});
    
    //if (typeof options.file == "undefined") {
    //	throw "The name of a file is needed to spawn a new process";
    //}
    //if (path.exists(options.file)) {
    //	throw "The file at '"+options.file+"' does not exist";
    //}
    //var child_process = spawn('node', [options.file].concat(options.arguments));
    return new process(config.id, config.child_process_creator);
};

process.prototype.kill = function(because){
    var self = this;
    var message = "Process ("+self.id+") is being killed";
    if (because) {
	console.log(because);
    }
    self.process.kill('SIGKILL');
};

process.prototype.restart = function(){
    var self = this;
    self.process = self.child_process_creator.call();
};

exports.process = process;