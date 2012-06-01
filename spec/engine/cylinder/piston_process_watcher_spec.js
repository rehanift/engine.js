var mock = require("../../spec_helper").mock,
    PistonProcessWatcher = require("../../../lib/engine/cylinder/piston_process_watcher");

describe("PistonProcessWatcher", function(){
  beforeEach(function(){
    this.watcher = PistonProcessWatcher.create();
  });

  it("emits 'piston error' events when the watched Piston process emits an error", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston error", callback);
    this.watcher.start_watching(piston_process);
    piston_process.emit("process error", "foo");
    expect(callback).toHaveBeenCalledWith("foo");
  });

  it("emits a 'piston crash' event when the watched Piston process dies unexpectedly", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston crash", callback);
    this.watcher.start_watching(piston_process);
    piston_process.emit("process crash", "foo_code", "bar_signal");
    expect(callback).toHaveBeenCalledWith("foo_code","bar_signal");
  });

  it("emits a 'piston kill' event when the watched Piston process is killed", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston kill", callback);
    this.watcher.start_watching(piston_process);
    piston_process.emit("process kill");
    expect(callback).toHaveBeenCalled();
  });

  it("does not emit 'piston error' events after a watcher stops watching", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston error", callback);
    this.watcher.start_watching(piston_process);
    this.watcher.stop_watching();
    piston_process.emit("process error", "foo");
    expect(callback).not.toHaveBeenCalled();    
  });

  it("does not emit a 'piston crash' event after a watcher stops watching", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston crash", callback);
    this.watcher.start_watching(piston_process);
    this.watcher.stop_watching();
    piston_process.emit("process crash", "foo_code", "bar_signal");
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not emit a 'piston kill' event after a watcher stops watching", function(){
    var callback = jasmine.createSpy();
    var piston_process = new mock.PistonProcess();
    this.watcher.on("piston kill", callback);
    this.watcher.start_watching(piston_process);
    this.watcher.stop_watching();
    piston_process.emit("process kill");
    expect(callback).not.toHaveBeenCalled();
  });

});