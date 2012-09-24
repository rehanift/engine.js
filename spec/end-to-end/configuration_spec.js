var engine = require("../../engine").engine;
var task;
var factories = require("../spec_helper").component_factories;

describe("configurations", function(){

  describe("custom zeromq tcp endpoints", function(){
    
    beforeEach(function(){
      var offset = Math.floor(Math.random() * 1000);
      var base_port = 5555;

      this.client = engine.client.create({
        sending_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 0),
        listening_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 1)
      });
      this.intake = engine.intake.create({
        listening_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 0),
        sending_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 2)
      });
      this.cylinder = engine.cylinder.create({
        listening_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 2),
        exhaust_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 3)
      });
      this.exhaust = engine.exhaust.create({
        listening_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 3),
        publishing_endpoint: "tcp://127.0.0.1:" + (base_port + offset + 1)
      });
    });

    afterEach(function(){
      this.exhaust.close();
      this.cylinder.close();
      this.intake.close();
      this.client.close();
    });
    
    it("evaluates user code", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
      task.setLocals({});
      task.setCode("add(1,0)");        
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
        return callback.callCount > 0;
      });

      runs(function(){
        expect(callback.mostRecentCall.args[1].getEvaluation()).toBe(1);
      });
      
    });

    it("outputs console messages", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
      task.setLocals({});
      task.setCode("console.log('foo')");        
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
        return callback.callCount > 0;
      });

      runs(function(){
        expect(callback.mostRecentCall.args[1].getDebug()[0]).toBe("'foo'");
      });        
    });
    
  });

  describe("sensible defaults", function(){
    beforeEach(function(){
      waits(500);

      runs(function(){
	this.identifier = "basic" + Math.floor(Math.random() * 100000);

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


    it("locals are not required", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
      task.setCode("add(4,5)");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
        return callback.callCount > 0;
      });
      
      runs(function(){
        expect(callback.mostRecentCall.args[1].getEvaluation()).toBe(9);
      });              
    });

    it("a context is not required", function(){
      var callback = jasmine.createSpy();
      task = this.client.createTask();
      task.setCode("4+5");
      task.on('eval', callback);
      task.run();
      
      waitsFor(function(){
        return callback.callCount > 0;
      });
      
      runs(function(){
        expect(callback.mostRecentCall.args[1].getEvaluation()).toBe(9);
      });              
    });

	   
  });
});