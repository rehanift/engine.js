var engine = function(){};
engine.util = require("./util");

var spawn = require("child_process").spawn,
    path = require("path");

var process = function(options){
    var self = this;
    self.id = engine.util.makeUUID({prefix:"process"});
    if (typeof options.file == "undefined") {
	throw "The name of a file is needed to spawn a new process";
    }
    if (path.exists(options.file)) {
	throw "The file at '"+options.file+"' does not exist";
    }
    self.process = spawn('node', [options.file].concat(options.arguments));

    var log = function(data){
	console.log("process",data.toString());
    };

    self.process.stdout.on("data", log);
    self.process.stderr.on("data", log);

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