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
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_spawner,'spawn_new_process').andReturn(stub_process);
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

  describe("process killing", function(){
    it("gets current Piston process", function(){
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      this.process_manager.kill_current_process();
      expect(this.process_manager.get_current_process).toHaveBeenCalled();
    });

    it("terminates the current Piston process", function(){
      var stub_process = new mock.PistonProcess();
      spyOn(stub_process,'kill');
      spyOn(this.process_manager,'get_current_process').andReturn(stub_process);
      this.process_manager.kill_current_process();
      expect(stub_process.kill).toHaveBeenCalled();
    });
  });

  it("logs errors from the Piston process", function(){
    spyOn(this.logging_gateway,'log');
    this.process_watcher.emit("piston error", "foo");
    expect(this.logging_gateway.log).toHaveBeenCalled();
  });

  describe("when a piston process crashes", function(){
    beforeEach(function(){
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_spawner,'spawn_new_process').andReturn(stub_process);
    });
    it("stop watching the current Piston process", function(){
      spyOn(this.process_watcher,'stop_watching');
      this.process_watcher.emit("piston crash");
      expect(this.process_watcher.stop_watching).toHaveBeenCalled();
    });

    it("starts a new Piston process", function(){
      spyOn(this.process_manager,'start_new_process');
      this.process_watcher.emit("piston crash");
      expect(this.process_manager.start_new_process).toHaveBeenCalled();
    });

    it("emits a 'piston crash' event", function(){
      spyOn(this.process_manager,'emit');
      this.process_watcher.emit("piston crash", "error_code", "error_signal");
      expect(this.process_manager.emit).toHaveBeenCalledWith("piston crash", "error_code", "error_signal");
    });    
  });

  describe("when a piston is killed", function(){
    beforeEach(function(){
      var stub_process = new mock.PistonProcess();
      spyOn(this.process_spawner,'spawn_new_process').andReturn(stub_process);
    });
    it("stop watching the current Piston process", function(){
      spyOn(this.process_watcher,'stop_watching');
      this.process_watcher.emit("piston kill");
      expect(this.process_watcher.stop_watching).toHaveBeenCalled();
    });

    it("starts a new Piston process", function(){
      spyOn(this.process_manager,'start_new_process');
      this.process_watcher.emit("piston kill");
      expect(this.process_manager.start_new_process).toHaveBeenCalled();
    });

    it("emits a 'piston restart' event", function(){
      spyOn(this.process_manager,'emit');
      this.process_watcher.emit("piston kill");
      expect(this.process_manager.emit).toHaveBeenCalledWith("piston restart");
    });
  });

  it("stores a Piston process", function(){
    var stub_process = new mock.PistonProcess();
    this.process_manager.set_current_process(stub_process);
    expect(this.process_manager.get_current_process()).toEqual(stub_process);
  });

  describe("sending and receiving tasks", function(){
    it("sends tasks to the piston process", function(){
      var stub_process = new mock.PistonProcess();
      spyOn(stub_process,"send");
      var stub_task = new Object();
      this.process_manager.set_current_process(stub_process);
      this.process_manager.send_task_to_piston(stub_task);
      expect(stub_process.send).toHaveBeenCalledWith(stub_task);
    });

    it("receives task results from the piston process", function(){
      spyOn(this.process_manager,"emit");
      var stub_process = new mock.PistonProcess();
      this.process_manager.set_current_process(stub_process);
      var stub_response = new Object();
      stub_process.emit("message", stub_response);
      expect(this.process_manager.emit).toHaveBeenCalledWith("task response", stub_response);
    });
  });
});