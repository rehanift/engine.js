var ContextifyTaskExecutor = require("../../../lib/engine/piston/contextify_task_executor");
var TaskRequest = require("../../../lib/engine/common/task_request");
var TaskResponse = require("../../../lib/engine/client/task/response").TaskResponse;

describe("ContextifyTaskExecutor", function(){
  beforeEach(function(){
    this.executor = ContextifyTaskExecutor.create();
    this.assert_task_response = function(task_request, task_response){
      var spy = jasmine.createSpy();
    
      this.executor.on("task executed", spy);

      runs(function(){
        this.executor.execute_task(task_request);      
      });

      waitsFor(function(){
        return spy.callCount > 0;
      });

      runs(function(){
        expect(spy).toHaveBeenCalledWith(task_response);
      });
    };

  });

  it("executes a simple TaskRequest", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(){ return { add:function(a,b){ return a+b; } } })",
      code: "add(2,2)",
      locals: {}
    });
    var simple_task_response = new TaskResponse({response:{evaluation:4}});

    this.assert_task_response(simple_task, simple_task_response);
  });

  it("executes a TaskRequest with locals", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello ' + locals.world; } } })",
      code: "hello()",
      locals: { world:"world" }
    });
    var simple_task_response = new TaskResponse({response:{evaluation: "hello world"}});
    
    this.assert_task_response(simple_task, simple_task_response);
  });

  it("executes a TaskRequest that contains syntax errors", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello'; } } })",
      code: "hello(",
      locals: { }
    });
    var simple_task_response = new TaskResponse({response:{error: "SyntaxError: Unexpected end of input"}});
    
    this.assert_task_response(simple_task, simple_task_response);
  });

  it("executes a TaskRequest that contains reference errors", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello'; } } })",
      code: "foo()",
      locals: { }
    });
    var simple_task_response = new TaskResponse({response:{error: "ReferenceError: foo is not defined"}});
    
    this.assert_task_response(simple_task, simple_task_response);
  });

  xit("executes a TaskRequest with asynchronous code");  
});