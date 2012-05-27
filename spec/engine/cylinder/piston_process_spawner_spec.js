var PistonProcessSpawner = require("../../../lib/engine/cylinder/piston_process_spawner");
var PistonProcess = require("../../../lib/engine/cylinder/piston_process");

describe("PistonProcessSpawner",function(){
  beforeEach(function(){
    var spawner = PistonProcessSpawner.create();
    this.process = spawner.spawn_new_process(__dirname + "/test_child_process.js");
  });

  it("spawns a new node process and returns it in a PistonProcess object", function(){
    expect(this.process instanceof PistonProcess).toBeTruthy();
    this.process.kill();
  });
});

describe("PistonProcess", function(){
  it("emits a 'process crash' event when the node process unexpectedly dies", function(){
    var callback = jasmine.createSpy();
    var spawner = PistonProcessSpawner.create();

    runs(function(){
      this.process = spawner.spawn_new_process(__dirname + "/test_child_process.js");
      this.process.on('process crash', callback);
      this.process.send_signal('SIGINT');
    });    

    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      expect(callback).toHaveBeenCalledWith(null, "SIGINT");
      this.process.kill();
    });
  });

  it("emits a 'process error' event when data is written to the node process's standard error stream", function(){
    var callback = jasmine.createSpy();
    var spawner = PistonProcessSpawner.create();

    runs(function(){
      this.process = spawner.spawn_new_process(__dirname + "/test_child_process.js");
      this.process.on('process error', callback);
    });    

    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      expect(callback).toHaveBeenCalled();
      this.process.kill();
    });    
  });
});