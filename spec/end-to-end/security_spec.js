var engine = require("../../engine").engine;
var factories = require("../spec_helper").component_factories;
var task;

describe("Sandbox Security", function(){

  beforeEach(function(){
    waits(500);

    runs(function(){

      this.identifier = "security" + Math.floor(Math.random() * 100000);

      this.intake = factories.create_ipc_intake(this.identifier);
      this.exhaust = factories.create_ipc_exhaust(this.identifier);
      this.cylinder = (factories.create_ipc_cylinders(1,this.identifier))["1"];
      this.client = (factories.create_ipc_clients(1,this.identifier))["1"];
    });
  });

  afterEach(function(){
    this.intake.close();
    this.exhaust.close();
    this.cylinder.close();
    this.client.close();
  });

  var getLastEval = function(cb) {
    return cb.mostRecentCall.args[1].getEvaluation();
  };

  describe("getting outside the sandbox", function(){
    it("cannot manipulate the host context", function(){
      var context = "(function(){ var host_date = new Date(); return { foo: function(){ return host_date; } } })";
      var callback = jasmine.createSpy();
      var callback2 = jasmine.createSpy();
      
      runs(function(){
        task = this.client.createTask();
        task.setContext(context);
        task.setLocals({});
        task.setCode("foo().__proto__.hacked = function(){ return 'YEP!'}; foo().hacked();");
        task.on('eval', callback);
        task.run();
      });      
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
        var task2 = this.client.createTask();
        task2.setContext("(function(){ return {} })");
        task2.setLocals({});
        task2.setCode("(new Date()).hacked()");
        task2.on('eval', callback2);
        task2.run();
      });      
      
      waitsFor(function(){
	return callback2.callCount > 0;
      });


      runs(function(){
	expect(getLastEval(callback2)).not.toContain("YEP!");
	expect(getLastEval(callback2)).toContain("TypeError");
      });

    });
  });


  describe("Function#toString attack", function(){
    it("throws a SecurityError when trying to call '.toString' on a context function", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return { foo: function(){ return 'bar' } } })");
      task.setLocals({});
      task.setCode("foo.toString()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).toContain("SecurityError");
      });

    });
  });

  describe("Function constructor attack",function(){
    it("throws a SecurityError when trying to call an explicit context function's constructor", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return { foo: function(){ } } })");
      task.setLocals({});
      task.setCode("foo.constructor('return process')()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).toContain("ReferenceError");
      });

    });

    xit("throws a SecurityError when trying to call an implicit context function's constructor", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("console.log.constructor('return process')()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).toContain("SecurityError");
      });

    });
  });

  describe("Function caller attack", function(){
    it("throws a TypeError when trying to walk the 'caller chain' from a locally defined & invoked function out of the sandbox", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("(function foo() { foo.caller.caller.toString(); })()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).toContain("TypeError");
      });
    });

    it("throws a TypeError when trying to walk the 'argument caller chain' from a locally defined & invoked function out of the sandbox", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("(function foo() {return [].slice.call(foo.caller.caller.arguments);})()");
      task.on('eval', callback);
      task.run();
      
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).toContain("TypeError");
      });
    });
  });

  describe("user-defined hook attacks", function(){
    it("'toJSON' methods cannot walk outside the sandbox", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("(function foo() {return {toJSON:function x(){ return x.caller.name}}})()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(getLastEval(callback)).not.toContain("stringify");
	expect(getLastEval(callback)).toContain("SecurityError");
      });
    });

    it("'toJSON' methods cannot walk outside the sandbox (nested)", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("(function foo() {return {foo:'bar', test: {toJSON:function x(){ return x.caller.name}}}})()");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(JSON.stringify(callback.mostRecentCall.args[1])).toContain("SecurityError");
      });
    });


    xit("'inspect' method cannot walk outside the sandbox", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("console.log({inspect: function x(){ return x.caller.caller.name } })");
      task.on('output', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
      });
    });

    xit("'inspect' method cannot walk outside the sandbox (nested)", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return {  } })");
      task.setLocals({});
      task.setCode("console.log({foo: 'bar', test: {inspect: function x(){ return x.caller.caller.name } }})");
      task.on('output', callback);
      task.run();
      
      waitsFor(function(){
	return callback.callCount > 0;
      });

      runs(function(){
	expect(callback.mostRecentCall.args[0]).toContain("SecurityError");
      });
    });

  });

});
