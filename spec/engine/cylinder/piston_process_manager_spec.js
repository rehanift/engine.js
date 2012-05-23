var PistonProcessManager = function(process_spawner, process_killer, process_watcher, logging_gateway){
  this.process_spawner = process_spawner;
  this.process_killer = process_killer;
  this.process_watcher = process_watcher;
  this.logging_gateway = logging_gateway;
};

PistonProcessManager.make = function(config){
  var manager = new PistonProcessManager(config.process_spawner, config.process_killer,
                                         config.process_watcher, config.logging_gateway);

  config.process_watcher.on("process error", function(message){
    config.logging_gateway.log({
      component: "Piston",
      action: "Error" + message
    });
  });

  return manager;
};

PistonProcessManager.create = function(){
  var manager = PistonProcessManager.make({});
  return manager;
};

PistonProcessManager.prototype.start_new_process = function(){
  var process = this.process_spawner.spawn_new_process();
  this.set_current_process(process);
  this.process_watcher.start_watching(process);
};

PistonProcessManager.prototype.terminate_current_process = function(){
  var process = this.get_current_process();
  this.process_killer.kill_process(process);
};

PistonProcessManager.prototype.get_current_process = function(){};
PistonProcessManager.prototype.set_current_process = function(process){};

//////////////////////////////////////////////////////////////////////

var mock = {},
    util = require("util"),
    events = require("events");

mock.PistonProcessSpawner = (function(){
  var klass = function(){};
  
  klass.prototype.spawn_new_process = function(){};

  return klass;
})();

mock.PistonProcessKiller = (function(){
  var klass = function(){};

  klass.prototype.kill_process = function(){};

  return klass;
})();

mock.PistonProcessWatcher = (function(){
  var klass = function(){};
  util.inherits(klass, events.EventEmitter);

  klass.prototype.start_watching = function(){};

  return klass;
})();

mock.LoggingGateway = (function(){
  var klass = function(){};

  klass.prototype.log = function(){};

  return klass;
})();

///////////////////////////////////////////////////////////////////////

var PistonProcess = function(){};

describe("Piston Process Manager", function(){
  beforeEach(function(){
    this.process_spawner = new mock.PistonProcessSpawner();
    this.process_killer = new mock.PistonProcessKiller();
    this.process_watcher = new mock.PistonProcessWatcher();
    this.logging_gateway = new mock.LoggingGateway();

    this.process_manager = PistonProcessManager.make({
      process_spawner: this.process_spawner,
      process_killer: this.process_killer,
      process_watcher: this.process_watcher,
      logging_gateway: this.logging_gateway
    });
  });

  describe("process spawning", function(){
    it("starts a new Piston process", function(){
      spyOn(this.process_spawner,'spawn_new_process');
      this.process_manager.start_new_process();
      expect(this.process_spawner.spawn_new_process).toHaveBeenCalled();
    });

    it("sets the new process as the current process", function(){
      var stub_process = new PistonProcess();
      spyOn(this.process_spawner,'spawn_new_process').andReturn(stub_process);
      spyOn(this.process_manager,'set_current_process');
      this.process_manager.start_new_process();
      expect(this.process_manager.set_current_process).toHaveBeenCalledWith(stub_process);
    });

    it("starts watching the current process",function(){
      var stub_process = new PistonProcess();
      spyOn(this.process_spawner,'spawn_new_process').andReturn(stub_process);
      spyOn(this.process_watcher,'start_watching');
      this.process_manager.start_new_process();      
      expect(this.process_watcher.start_watching).toHaveBeenCalledWith(stub_process);
    });
    
  });

  describe("process termination", function(){
    it("gets current Piston process", function(){
      spyOn(this.process_manager,'get_current_process');
      this.process_manager.terminate_current_process();
      expect(this.process_manager.get_current_process).toHaveBeenCalled();
    });

    it("terminates the current Piston process", function(){
      var stub_process = new PistonProcess();
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      spyOn(this.process_killer,"kill_process");
      this.process_manager.terminate_current_process();
      expect(this.process_killer.kill_process).toHaveBeenCalledWith(stub_process);
    });
  });

  it("logs errors from the Piston process", function(){
    spyOn(this.logging_gateway,'log');
    this.process_watcher.emit("process error", "foo");
    expect(this.logging_gateway.log).toHaveBeenCalled();
  });

  it("reports when a Piston process crashes");

  it("restarts a Piston process unexpectedly when the current on unexpectedly crashes");
});