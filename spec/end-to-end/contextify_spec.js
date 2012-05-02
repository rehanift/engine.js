var engine = require("../../engine").engine,
    factories = require("../spec_helper").component_factories,
    fs = require('fs'),
    task;


describe("Evaling with globals", function(){

  beforeEach(function(){
    this.identifier = "contextify" + Math.floor(Math.random() * 100000);

    this.intake = factories.create_ipc_intake(this.identifier);
    this.exhaust = factories.create_ipc_exhaust(this.identifier);
    this.cylinder = (factories.create_ipc_cylinders(1,this.identifier))["1"];
    this.client = (factories.create_ipc_clients(1,this.identifier))["1"];
  });

  afterEach(function(){
    this.intake.close();
    this.exhaust.close();
    this.cylinder.close();
    this.client.close();
  });

  var setupCountingContext = function() {
    task = arguments[0];

    if(arguments.length > 1) {
      var code = arguments[1];
    }else {
      var code = "incr_global() + incr_local()";
    }

    var countingContext = fs.readFileSync(process.cwd() + "/spec/helpers/counting_context.js", "utf8");
    task.setContext(countingContext);
    task.setLocals({count:5, foo:"bar"});
    task.setCode(code);

    var callback = jasmine.createSpy();
    task.on('eval', callback);
    task.run();
    return callback;
  }

  it("returns globals from the context", function(){
    task = this.client.createTask();
    var callback = setupCountingContext(task);

    waitsFor(function(){ return callback.callCount > 0 });

    runs(function(){
      var args = callback.mostRecentCall.args;
      var globals = args[1].getGlobals();

      expect(globals.count).toBe(4);
      expect(globals.hello).toBe("world");
    });

  });

  xit("returns locals from the context", function(){
    task = this.client.createTask();
    var callback = setupCountingContext(task);

    waitsFor(function(){ return callback.callCount > 0 });

    runs(function(){
      var args = callback.mostRecentCall.args;
      var locals = args[1].getLocals();

      expect(locals.count).toBe(6);
      expect(locals.foo).toBe("bar");
    });

  });

  it("returns the result from the code", function(){
    task = this.client.createTask();
    var callback = setupCountingContext(task);

    waitsFor(function(){ return callback.callCount > 0 });

    runs(function(){
      var args = callback.mostRecentCall.args;
      var lastEval = args[1].getEvaluation();

      expect(lastEval).toBe(10);
    });

  });

  describe("with an exception raised in the code", function(){
    it("returns the result from the code", function(){
      task = this.client.createTask();
      var callback = setupCountingContext(task, "noObject()");

      waitsFor(function(){ return callback.callCount > 0 });

      runs(function(){
        var args = callback.mostRecentCall.args;
        var lastEval = args[1].getEvaluation();

        expect(lastEval).toBe("ReferenceError: noObject is not defined");
      });

    });

    it("sets the TaskResponse isError to true", function(){
      task = this.client.createTask();
      var callback = setupCountingContext(task, "noObject()");

      waitsFor(function(){ return callback.callCount > 0 });

      runs(function(){
        var args = callback.mostRecentCall.args;

        expect(args[1].isError()).toBe(true);
      });

    });
  });

});
