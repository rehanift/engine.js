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
  "use strict";

  var self = this;
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

  var async_callback_register = require("../../async").create();

  var child_globals = this.render_child_globals(task_request, async_callback_register);

  var child_global_object = vm.runInContext("this", child_context);

  var child_global_names = Object.keys(child_globals);
  child_global_names.forEach(function(name){
    child_global_object[name] = child_grafter.graft(child_globals[name]);
  });

  var last_eval;
  var response;

  async_callback_register.on("done", function(){
    self.emit("task executed", response);
  });
  
  try {
    last_eval = vm.runInContext(task_request.getCode(), child_context);
    response = new TaskResponse({
      response:{
        evaluation: last_eval,
        globals: vm.getGlobalFromContext(child_context)
      }
    });
  } catch(e) {
    response = new TaskResponse({response:{error: e.name + ": " + e.message}});
  }
  
  async_callback_register.end();
};

ContextifyTaskExecutor.prototype.render_child_globals = function(task_request, async_callback_register){
  var async = async_callback_register;
  var child_globals = eval(task_request.getContext())(task_request.getLocals());
  return child_globals;
};

module.exports = ContextifyTaskExecutor;