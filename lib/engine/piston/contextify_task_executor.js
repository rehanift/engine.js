var util = require("util");
var events = require("events");

var TaskResponse = require("../client/task/response").TaskResponse;

var ContextifyTaskExecutor = function(){};
util.inherits(ContextifyTaskExecutor, events.EventEmitter);

ContextifyTaskExecutor.make = function(){
  var task_executor = new ContextifyTaskExecutor();
  return task_executor;
};

ContextifyTaskExecutor.create = function(){
  var task_executor = ContextifyTaskExecutor.make({});
  return task_executor;
};

ContextifyTaskExecutor.prototype.execute_task = function(task_request){
  var vm = require("contextify");
  var grafter_source_loader = require("object-grafter").create();
  var grafter_source = grafter_source_loader.load_source();

  var child_context = vm.createContext();

  vm.runInContext(grafter_source, child_context);
  var child_grafter = vm.runInContext("ObjectGrafter.create()",child_context);
  child_grafter.set_host_builtin_objects({
    "Array": Array,
    "Date" : Date,
    "Error" : Error,
    "RegExp" : RegExp,
    "Object" : Object,
    "String" : String
  });

  var child_globals = this.render_child_globals(task_request);

  var child_global_object = vm.runInContext("this", child_context);

  var child_global_names = Object.keys(child_globals);
  child_global_names.forEach(function(name){
    child_global_object[name] = child_grafter.graft(child_globals[name]);
  });


  var last_eval = vm.runInContext(task_request.getCode(), child_context);

  var response = new TaskResponse({response:{evaluation: last_eval}});
  this.emit("task executed", response);
};

ContextifyTaskExecutor.prototype.render_child_globals = function(task_request){
  var child_globals = eval(task_request.getContext())();
  return child_globals;
};

module.exports = ContextifyTaskExecutor;