var mock = require("../../spec_helper").mock,
    util = require("util"),
    events = require("events");

var PistonProcessManager = require("../../../lib/engine/cylinder/piston_process_manager");
var PistonProcess = require("../../../lib/engine/cylinder/piston_process");

describe("Piston Process Manager", function(){
  beforeEach(function(){
    this.process_spawner = new mock.PistonProcessSpawner();
    this.process_watcher = new mock.PistonProcessWatcher();
    this.logging_gateway = new mock.LoggingGateway();

    this.process_manager = PistonProcessManager.make({
      process_spawner: this.process_spawner,
      process_watcher: this.process_watcher,
      logging_gateway: this.logging_gateway
    });
  });

  describe("process spawning", function(){
    it("starts a new Piston process", function(){
      spyOn(this.process_spawner,'spawn_new_process');
      this.process_manager.start_new_process("my_script",["foo","bar"]);
      expect(this.process_spawner.spawn_new_process).toHaveBeenCalledWith("my_script",["foo","bar"]);
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
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      this.process_manager.terminate_current_process();
      expect(this.process_manager.get_current_process).toHaveBeenCalled();
    });

    it("terminates the current Piston process", function(){
      var stub_process = new mock.PistonProcess();
      spyOn(stub_process,'terminate');
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      this.process_manager.terminate_current_process();
      expect(stub_process.terminate).toHaveBeenCalled();
    });

    it("stops watching events on the current Piston process", function(){
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      spyOn(this.process_watcher,'stop_watching');
      this.process_manager.terminate_current_process();      
      expect(this.process_watcher.stop_watching).toHaveBeenCalled();
    });
  });

  it("logs errors from the Piston process", function(){
    spyOn(this.logging_gateway,'log');
    this.process_watcher.emit("process error", "foo");
    expect(this.logging_gateway.log).toHaveBeenCalled();
  });

  it("emits a 'piston crash' event", function(){
    spyOn(this.process_manager,'emit');
    this.process_watcher.emit("process crash", "error_code", "error_signal");
    expect(this.process_manager.emit).toHaveBeenCalledWith("piston crash", "error_code", "error_signal");
  });

  it("stores a Piston process", function(){
    var stub_process = new mock.PistonProcess();
    this.process_manager.set_current_process(stub_process);
    expect(this.process_manager.get_current_process()).toEqual(stub_process);
  });
});