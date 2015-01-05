var PistonProcess = require("./piston_process");

var PistonProcessSpawner = function(piston_script, script_args, run_as_user, run_as_group, env){
  this.piston_script = piston_script;
  this.script_args = script_args;
  this.run_as_user = run_as_user;
  this.run_as_group = run_as_group;
  this.env = env;
};

PistonProcessSpawner.make = function(config){
  var process_spawner = new PistonProcessSpawner(config.piston_script, 
                                                 config.script_args,
                                                 config.run_as_user,
                                                 config.run_as_group,
                                                 config.env);
  return process_spawner;
};

PistonProcessSpawner.create = function(options){

  var process_spawner = PistonProcessSpawner.make({
    piston_script: options.piston_script,
    script_args: options.script_args,
    run_as_user: options.run_as_user,
    run_as_group: options.run_as_group,
    env: options.env
  });
  return process_spawner;
};

PistonProcessSpawner.prototype.spawn_new_process = function(){
  var fork = require("child_process").fork;

  if (typeof(this.env) == "undefined") this.env = {};
  
  var node_process = fork(this.piston_script, this.script_args, 
                          { silent: true, stdio:"pipe", uid: this.run_as_user, gid: this.run_as_group, env: this.env});

  var piston_process = PistonProcess.create({node_process: node_process});

  return piston_process;
};

module.exports = PistonProcessSpawner;