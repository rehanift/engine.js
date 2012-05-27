var util = require("util"),
    events = require("events");

var PistonProcessManager = function(process_spawner, process_watcher, logging_gateway){
  this.process_spawner = process_spawner;
  this.process_watcher = process_watcher;
  this.logging_gateway = logging_gateway;
};
util.inherits(PistonProcessManager,events.EventEmitter);

PistonProcessManager.make = function(config){
  var manager = new PistonProcessManager(config.process_spawner, 
                                         config.process_watcher, 
                                         config.logging_gateway);

  manager.process_watcher.on("process error", function(message){
    manager.logging_gateway.log({
      component: "Piston",
      action: "Error: " + message
    });
  });

  manager.process_watcher.on("process crash", function(code, signal){
    manager.emit("piston crash", code, signal);
  });

  return manager;
};

PistonProcessManager.create = function(){
  var manager = PistonProcessManager.make({});
  return manager;
};

PistonProcessManager.prototype.start_new_process = function(script, args){
  var process = this.process_spawner.spawn_new_process(script, args);
  this.set_current_process(process);
  this.process_watcher.start_watching(process);
};

PistonProcessManager.prototype.terminate_current_process = function(){
  var process = this.get_current_process();
  process.terminate();
  this.process_watcher.stop_watching();
};

PistonProcessManager.prototype.get_current_process = function(){ 
  return this.process; 
};

PistonProcessManager.prototype.set_current_process = function(process){ 
  this.process = process; 
};

module.exports = PistonProcessManager;