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

  manager.process_watcher.on("piston error", function(message){
    manager.logging_gateway.log({
      component: "Piston",
      action: "Error: " + message
    });
  });

  manager.process_watcher.on("piston crash", function(code, signal){
    manager.process_watcher.stop_watching();
    manager.start_new_process();
    manager.emit("piston crash", code, signal);
  });

  manager.process_watcher.on("piston kill", function(){
    manager.process_watcher.stop_watching();
    manager.start_new_process();
    manager.emit("piston restart");
  });

  return manager;
};

PistonProcessManager.create = function(options){
  var process_spawner = require("./piston_process_spawner").create({
    piston_script: options.piston_script,
    script_args: options.script_args
  });
  var process_watcher = require("./piston_process_watcher").create();

  var manager = PistonProcessManager.make({
    process_spawner: process_spawner,
    process_watcher: process_watcher,
    logging_gateway: options.logging_gateway
  });

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

PistonProcessManager.prototype.kill_current_process = function(){
  var process = this.get_current_process();
  process.kill();
};

PistonProcessManager.prototype.get_current_process = function(){ 
  return this.process; 
};

PistonProcessManager.prototype.set_current_process = function(process){ 
  this.process = process; 
};

module.exports = PistonProcessManager;