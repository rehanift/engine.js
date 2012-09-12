var ContextifyTaskExecutor = require("../../../lib/engine/piston/contextify_task_executor");
var TaskRequest = require("../../../lib/engine/common/task_request");
var TaskResponse = require("../../../lib/engine/client/task/response").TaskResponse;

describe("ContextifyTaskExecutor", function(){
  beforeEach(function(){
    this.executor = ContextifyTaskExecutor.create();
    this.assert_task_response = function(task_request, cb){
      var spy = jasmine.createSpy();
    
      this.executor.on("task executed", spy);

      runs(function(){
        this.executor.execute_task(task_request);      
      });

      waitsFor(function(){
        return spy.callCount > 0;
      });

      runs(function(){
        var response = spy.mostRecentCall.args[0];        
        cb(response);
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

    this.assert_task_response(simple_task, function(response){
      expect(response.getEvaluation()).toBe(4);
    });
  });

  it("executes a TaskRequest with locals", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello ' + locals.world; } } })",
      code: "hello()",
      locals: { world:"world" }
    });
    
    this.assert_task_response(simple_task, function(response){
      expect(response.getEvaluation()).toBe("hello world");
    });
  });

  it("executes a TaskRequest that contains syntax errors", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello'; } } })",
      code: "hello(",
      locals: { }
    });
    
    this.assert_task_response(simple_task, function(response){
      expect(response.params.response.error).toContain("SyntaxError");
    });
  });

  it("executes a TaskRequest that contains reference errors", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { hello:function(){ return 'hello'; } } })",
      code: "foo()",
      locals: { }
    });
    
    this.assert_task_response(simple_task, function(response){
      expect(response.params.response.error).toContain("ReferenceError");
    });

  });

  it("executes a TaskRequest with asynchronous code", function(){
    var fs = require("fs");
    var async_context = fs.readFileSync(__dirname + "/resources/async_task_context.js", "utf-8");
    var simple_task = new TaskRequest({
      task_id: "2",
      context: async_context,
      code: "foo = 'bar'; my_async_function(function(){ foo = 'qux'; });",
      locals: { }
    });
    
    this.assert_task_response(simple_task, function(response){
      expect((response.getGlobals()).foo).toBe("qux");
    });    
  });

  it("returns global variables after the TaskRequest has executed", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(locals){ return { } })",
      code: "foo = 'bar';",
      locals: { }
    });
    
    this.assert_task_response(simple_task, function(response){
      expect((response.getGlobals()).foo).toBe("bar");
    });
  });
});