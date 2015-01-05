var PistonProcessSpawner = require("../../../lib/engine/cylinder/piston_process_spawner");
var PistonProcess = require("../../../lib/engine/cylinder/piston_process");

var uidNumber = require("uid-number");

describe("PistonProcessSpawner",function(){
  beforeEach(function(){
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: [],
      run_as_user: process.getuid(),
      run_as_group: process.getgid()
    });
    this.process = spawner.spawn_new_process();
  });

  it("spawns a new node process and returns it in a PistonProcess object", function(){
    expect(this.process instanceof PistonProcess).toBeTruthy();
    this.process.kill();
  });

  it("spawns a new node process running as the specified user and group", function(){
    var nobody_uid = false, nobody_gid = false;
    var callback = jasmine.createSpy();
    var spawner;

    runs(function(){
      uidNumber("nobody", "nogroup", function(err, uid, gid){
        nobody_uid = uid;
        nobody_gid = gid;
      });
    });

    waitsFor(function(){
      return nobody_uid && nobody_gid;
    });
    
    runs(function(){
      spawner = PistonProcessSpawner.create({
        piston_script: __dirname + "/test_child_process_dump_uid_gid.js",
        script_args: [],
        run_as_user: nobody_uid,
        run_as_group: nobody_gid
      });

      this.process = spawner.spawn_new_process();
      this.process.on('process error', callback);
    });    

    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      var output_raw = callback.mostRecentCall.args[0];
      var output_json = JSON.parse(output_raw);

      expect(output_json.uid).toBe(nobody_uid);
      expect(output_json.gid).toBe(nobody_gid);

      this.process.kill();
    });    

  });

  it("spawns a new node process running as the specified user and group", function(){
    var env;
    var callback = jasmine.createSpy();
    var spawner;
    
    runs(function(){
      spawner = PistonProcessSpawner.create({
        piston_script: __dirname + "/test_child_process_dump_env.js",
        script_args: [],
        env: {"foo":"bar"}
      });

      this.process = spawner.spawn_new_process();
      this.process.on('process error', callback);
    });    

    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      var output_raw = callback.mostRecentCall.args[0];
      var output_json = JSON.parse(output_raw);

      expect(output_json.env).toEqual({"foo":"bar"});

      this.process.kill();
    });    

  });

  it("spawns a new node process running as the specified user and group");
});

describe("PistonProcess", function(){
  it("emits a 'process crash' event when the node process unexpectedly dies", function(){
    var callback = jasmine.createSpy();
    var spawner = PistonProcessSpawner.create({
      piston_script: __dirname + "/test_child_process.js",
      script_args: [],
      run_as_user: process.getuid(),
      run_as_group: process.getgid()
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
      script_args: [],
      run_as_user: process.getuid(),
      run_as_group: process.getgid()
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
      script_args: [],
      run_as_user: process.getuid(),
      run_as_group: process.getgid()
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