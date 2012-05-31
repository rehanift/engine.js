var engine = require("../../engine").engine;
var factories = require("../spec_helper").component_factories;
var task;

var loadResource = function(file){
  var fs = require("fs");
  return fs.readFileSync(__dirname + "/../resources/" + file, "utf-8");
};

describe("basic operations", function(){
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

    var getLastEval = function(cb) {
      return cb.mostRecentCall.args[1].getEvaluation();
    }

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
          expect(getLastEval(callback)).toBe(1);
        });
        
    });

    it("outputs console messages", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("console.log('foo')");        
        task.on('output', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(callback.mostRecentCall.args[0]).toBe("'foo'");
        });        
    });

    it("can access a context's local variables", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { getFoo:function(){ return locals.foo; } } })");
        task.setLocals({foo:"FOO"});
        task.setCode("getFoo()");        
        task.on('eval', callback);
        task.run();
        
        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            expect(getLastEval(callback)).toBe("FOO");
        });        
    });


    it("evaluates user-code and outputs console messages", function(){
        var output_callback = jasmine.createSpy();
        var eval_callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext("(function(locals){ return { setTimeout: setTimeout, add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("setTimeout(function(){ console.log('foo'); }, 100); 'foo'");        
        task.on('output', output_callback);
        task.on('eval', eval_callback);
        task.run();
        
        waitsFor(function(){
            return eval_callback.callCount > 0 && output_callback.callCount > 0;
        });

        runs(function(){
            expect(output_callback.mostRecentCall.args[0]).toBe("'foo'");
            expect(getLastEval(eval_callback)).toBe("foo");
        });

    });

    it("evaluates two tasks", function(){
        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("add(1,1)");        
        task.run();
        task.on('eval', callback1);

        var task2 = this.client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(3,4)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(getLastEval(callback1)).toBe(2);
            expect(getLastEval(callback2)).toBe(7);
        });
        
    });

    it("evaluates two tasks across two cylinders", function(){
        var cylinder2 = factories.create_ipc_cylinders(1, this.identifier)["1"];

        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        spyOn(this.cylinder.sending_socket,'send').andCallThrough();
        spyOn(cylinder2.sending_socket,'send').andCallThrough();

        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("var start = new Date(); while( (new Date()) - start < 500 ) { /* sleep */ }; add(1,1)");        
        task.run();
        task.on('eval', callback1);

        var task2 = this.client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("var start = new Date(); while( (new Date()) - start < 500 ) { /* sleep */ }; add(3,4)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(this.cylinder.sending_socket.send).toHaveBeenCalled();
            expect(cylinder2.sending_socket.send).toHaveBeenCalled();
            expect(getLastEval(callback1)).toBe(2);
            expect(getLastEval(callback2)).toBe(7);
            cylinder2.close();
        });
              
    });

    it("task tasks, two cylinders, both pushlishing to console", function(){
        var cylinder2 = factories.create_ipc_cylinders(1, this.identifier)["1"];

        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = this.client.createTask();
        task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task.setLocals({});
        task.setCode("console.log(add(1,1))");        
        task.run();
        task.on('output', callback1);

        var task2 = this.client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("console.log(add(3,4))");        
        task2.run();
        task2.on('output', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toBe('2');
            expect(callback2.mostRecentCall.args[0]).toBe('7');
            cylinder2.close();
        });
              
    });

    it("evaluates two tasks with one cylinder. First task timeouts.", function(){
        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = this.client.createTask();
        task.setContext("(function(locals){ return { sleep: function() { var now = new Date().getTime(); while(new Date().getTime() < now + 100000) { /* sleep */ } } } })");
        task.setLocals({});
        task.setCode("sleep()");        
        task.run();
        task.on('eval', callback1);

        var task2 = this.client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(4,5)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        },null, 100000);

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toContain("TimeoutError");
            expect(getLastEval(callback2)).toBe(9);
        });
        
    });

    it("evaluates two tasks with one cylinder. First task crashes.", function(){
        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        task = this.client.createTask();
        task.setContext(loadResource("contexts/self-segfault.js"));
        task.setLocals({});
        task.setCode(loadResource("code/self-segfault.js"));        
        task.run();
        task.on('eval', callback1);

        var task2 = this.client.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(5,6)");        
        task2.run();
        task2.on('eval', callback2);
        
        waitsFor(function(){
            return callback1.callCount > 0 && callback2.callCount > 0;
        });

        runs(function(){
            expect(callback1.mostRecentCall.args[0]).toContain("UnexpectedError");
            expect(getLastEval(callback2)).toBe(11);
        });
        
    });

    it("evaluates two tasks from two clients", function(){
	var client2 = factories.create_ipc_clients(1,this.identifier)["1"];

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

        var callback2 = jasmine.createSpy();
        var task2 = client2.createTask();
        task2.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
        task2.setLocals({});
        task2.setCode("add(2,2)");        
        task2.on('eval', callback2);
        task2.run();
        
        waitsFor(function(){
            return callback.callCount > 0 && callback2.callCount;
        });

        runs(function(){
            expect(getLastEval(callback)).toBe(1);
            expect(getLastEval(callback2)).toBe(4);
            
	    client2.close();
        });
        
    });

    it("captures asynchronously globally set variables", function(){
        var callback = jasmine.createSpy();
        task = this.client.createTask();
        task.setContext(loadResource("contexts/simple-async.js"));
        task.setLocals({});
        task.setCode(loadResource("code/simple-async.js"));
        task.on('eval', callback);
        task.run();

        waitsFor(function(){
            return callback.callCount > 0;
        });

        runs(function(){
            var globals = callback.mostRecentCall.args[1].getGlobals();          
            expect(globals.foo).toBe("bar");
        });
    });

});
