var PistonProcess = require("./piston_process");

var PistonProcessSpawner = function(){};

PistonProcessSpawner.make = function(){
  var process_spawner = new PistonProcessSpawner();
  return process_spawner;
};

PistonProcessSpawner.create = function(){
  var process_spawner = PistonProcessSpawner.make({});
  return process_spawner;
};

PistonProcessSpawner.prototype.spawn_new_process = function(script, args){
  var spawn = require("child_process").spawn;
  
  var node_process = spawn("node",[script].concat(args));

  var piston_process = PistonProcess.create({node_process: node_process});

  return piston_process;
};

module.exports = PistonProcessSpawner;