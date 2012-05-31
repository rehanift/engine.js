var PistonProcessSpawner = require("../../../lib/engine/cylinder/piston_process_spawner");
var PistonProcess = require("../../../lib/engine/cylinder/piston_process");

describe("PistonProcessSpawner",function(){
  beforeEach(function(){
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: []
    });
    this.process = spawner.spawn_new_process();
  });

  it("spawns a new node process and returns it in a PistonProcess object", function(){
    expect(this.process instanceof PistonProcess).toBeTruthy();
    this.process.kill();
  });
});

describe("PistonProcess", function(){
  it("emits a 'process crash' event when the node process unexpectedly dies", function(){
    var callback = jasmine.createSpy();
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: []
    });

    runs(function(){
      this.process = spawner.spawn_new_process();
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
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: []
    });

    runs(function(){
      this.process = spawner.spawn_new_process();
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

  it("emits a 'process kill' event when the node process is killed", function(){
    var callback = jasmine.createSpy();
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: []
    });

    runs(function(){
      this.process = spawner.spawn_new_process();
      this.process.on('process kill', callback);
      this.process.kill();
    });    

    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      expect(callback).toHaveBeenCalled();
      //this.process.kill();
    });    
  });
});