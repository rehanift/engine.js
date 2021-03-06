var util = require("util");
var events = require("events");

var fs = require("fs");
var bootstrap = fs.readFileSync(__dirname + "/execution_strategies/context-bootstrap.js", "utf-8");

var grafter_source_loader = require("object-grafter").create();
var grafter_source = grafter_source_loader.load_source();

var es6_collections_path = require.resolve("es6-collections");
var es6_collections_source = fs.readFileSync(es6_collections_path, "utf-8");

var TaskResponse = require("../client/task/response").TaskResponse;

var async_helper = require("../../async");

var vm = require("contextify");

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

  var child_context = vm.createContext();

  vm.runInContext(es6_collections_source, child_context);
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

  var async_callback_register = async_helper.create();

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
  
  this.bootstrap_child_context(vm, child_context);

  try {
    last_eval = vm.runInContext(task_request.getCode(), child_context);
    response = new TaskResponse({
      task_id: task_request.getTaskId(),
      response:{
        evaluation: last_eval,
        globals: vm.getGlobalFromContext(child_context),
        debug: child_global_object["console"].dump()
      }
    });
  } catch(e) {
    response = new TaskResponse({
      task_id: task_request.getTaskId(),
      response:{
        evaluation: e.name + ": " + e.message,
        error: true
      }
    });
  }
  
  async_callback_register.end();
};

ContextifyTaskExecutor.prototype.render_child_globals = function(task_request, async_callback_register){
  var async = async_callback_register;
  var child_globals = eval(task_request.getContext())(task_request.getLocals());

  this.inject_implicit_globals(child_globals);

  return child_globals;
};

ContextifyTaskExecutor.prototype.bootstrap_child_context = function(vm, child_context){
  vm.runInContext(bootstrap, child_context);
};

ContextifyTaskExecutor.prototype.inject_implicit_globals = function(child_globals){
  var console = ConsoleInspector.create();
  child_globals.console = console;
};

var inspect_safe = require("../../inspect_safe").inspect;
var ConsoleInspector = function(){
  this.output = [];
  this.inspect = inspect_safe;
};

ConsoleInspector.make = function(){
  var console_inspector = new ConsoleInspector();
  return console_inspector;
};

ConsoleInspector.create = function(){
  var console_inspector = ConsoleInspector.make({});
  return console_inspector;
};

ConsoleInspector.prototype.log = function(data){
  this.output.push(this.inspect(data));
};
ConsoleInspector.prototype.dump = function(){
  return this.output;
};

module.exports = ContextifyTaskExecutor;