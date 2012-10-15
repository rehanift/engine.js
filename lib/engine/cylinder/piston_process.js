var util = require("util"),
    events = require("events");

var PistonProcess = function(node_process){
  this.node_process = node_process;
};
util.inherits(PistonProcess,events.EventEmitter);

PistonProcess.make = function(config){
  var piston_process = new PistonProcess(config.node_process);

  piston_process.node_process.on("exit", function(code, signal){
    if (code == 1) {
      return false;
    }

    if(signal == "SIGKILL") {
      piston_process.emit("process kill");
      return true;
    }

    piston_process.emit("process crash", code, signal);
  });

  piston_process.node_process.stderr.on("data", function(data){
    piston_process.emit("process error", data.toString());
  });

  piston_process.node_process.on("message", function(data){
    piston_process.emit("message", data);
  });

  return piston_process;
};

PistonProcess.create = function(options){
  var piston_process = PistonProcess.make({
    node_process: options.node_process
  });
  return piston_process;
};

PistonProcess.prototype.kill = function(){
  this.node_process.kill("SIGKILL");
};

PistonProcess.prototype.terminate = function(){
  this.node_process.kill();
};

PistonProcess.prototype.send_signal = function(signal){
  this.node_process.kill(signal);
};

PistonProcess.prototype.send = function(data){
  this.node_process.send(data);
};

module.exports = PistonProcess;