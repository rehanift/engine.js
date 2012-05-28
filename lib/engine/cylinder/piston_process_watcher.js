var util = require("util"),
    events = require("events");

var PistonProcessWatcher = function(){};
util.inherits(PistonProcessWatcher, events.EventEmitter);

PistonProcessWatcher.make = function(){
  var process_watcher = new PistonProcessWatcher();
  return process_watcher;
};

PistonProcessWatcher.create = function(){
  var process_watcher = PistonProcessWatcher.make({});
  return process_watcher;
};

PistonProcessWatcher.prototype.start_watching = function(process){
  var self = this;
  self.process = process;

  self.process.on("process error", function(data){
    self.emit("piston error", data);
  });

  self.process.on("process crash", function(code, signal){
    self.emit("piston crash", code, signal);
  });

  self.process.on("process kill", function(){
    self.emit("piston kill");
  });
};

PistonProcessWatcher.prototype.stop_watching = function(){
  this.process.removeAllListeners("process error");
  this.process.removeAllListeners("process crash");
  this.process.removeAllListeners("process kill");
};

module.exports = PistonProcessWatcher;