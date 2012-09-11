var ContextifyTaskExecutor = require("../../../lib/engine/piston/contextify_task_executor");
var TaskRequest = require("../../../lib/engine/common/task_request");
var TaskResponse = require("../../../lib/engine/client/task/response").TaskResponse;

describe("ContextifyTaskExecutor", function(){
  beforeEach(function(){
    this.executor = ContextifyTaskExecutor.create();
  });

  it("executes a simple TaskRequest", function(){
    var simple_task = new TaskRequest({
      task_id: "2",
      context: "(function(){ return { add:function(a,b){ return a+b; } } })",
      code: "add(2,2)",
      locals: {}
    });
    var simple_task_response = new TaskResponse({response:{evaluation:4}});
    var spy = jasmine.createSpy();
    
    this.executor.on("task executed", spy);

    runs(function(){
      this.executor.execute_task(simple_task);      
    });

    waitsFor(function(){
      return spy.callCount > 0;
    });

    runs(function(){
      expect(spy).toHaveBeenCalledWith(simple_task_response);
    });    
  });
});