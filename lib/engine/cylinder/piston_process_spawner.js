var PistonProcess = require("./piston_process");

var PistonProcessSpawner = function(piston_script, script_args){
  this.piston_script = piston_script;
  this.script_args = script_args;
};

PistonProcessSpawner.make = function(config){
  var process_spawner = new PistonProcessSpawner(config.piston_script, config.script_args);
  return process_spawner;
};

PistonProcessSpawner.create = function(options){
  var process_spawner = PistonProcessSpawner.make({
    piston_script: options.piston_script,
    script_args: options.script_args
  });
  return process_spawner;
};

PistonProcessSpawner.prototype.spawn_new_process = function(){
  var spawn = require("child_process").spawn;
  
  var node_process = spawn("node",[this.piston_script].concat(this.script_args));

  var piston_process = PistonProcess.create({node_process: node_process});

  return piston_process;
};

module.exports = PistonProcessSpawner;