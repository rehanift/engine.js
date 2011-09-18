var util = require("util"),
    events = require("events");

var executionWatcher = function(threshold){
    var self = this;
    self.threshold = threshold;
    self.running = false;
};
util.inherits(executionWatcher, events.EventEmitter);

executionWatcher.prototype.start = function(){
    var self = this;
    if (self.running) {
        throw "This watcher has already been started";
    }
    self.running = true;
    self.timeout = setTimeout(function(){
        self.emit("kill");
    },self.threshold);
};
executionWatcher.prototype.clear = function(){
    var self = this;
    clearTimeout(self.timeout);
    self.running = false;
};

executionWatcher.make = function(config){ 
    return new executionWatcher(config.threshold);
};

exports.executionWatcher = executionWatcher;