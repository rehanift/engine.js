var util = require("util"),
    events = require("events");

var execution_watcher = function(threshold){
    var self = this;
    self.threshold = threshold;
    self.running = false;
};
util.inherits(execution_watcher, events.EventEmitter);

execution_watcher.prototype.start = function(){
    var self = this;
    process.nextTick(function(){
	if (self.running) {
            throw "This watcher has already been started";
	}
	self.running = true;
	self.timeout = setTimeout(function(){
            self.emit("kill");
	},self.threshold);
    });   
};
execution_watcher.prototype.clear = function(){
    var self = this;
    clearTimeout(self.timeout);
    self.running = false;
};

execution_watcher.make = function(config){ 
    return new execution_watcher(config.threshold);
};

exports.execution_watcher = execution_watcher;