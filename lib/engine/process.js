var engine = function(){};
engine.util = require("./util");

var spawn = require("child_process").spawn;

var process = function(options){
    var self = this;
    self.id = engine.util.makeUUID({prefix:"process"});
    if (typeof options.file == "undefined") {
	throw "The name of a file is needed to spawn a new process";
    }
    self.process = spawn('node', [options.file].concat(options.arguments));
};

process.prototype.kill = function(because){
    var self = this;
    var message = "Process ("+self.id+") is being killed";
    if (because) {
	console.log(because);
    }
    self.process.kill('SIGKILL');
};

exports.process = process;