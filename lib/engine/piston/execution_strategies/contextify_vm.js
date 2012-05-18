var vm = function(){
  //avoid contextify's js wrapper
  var contextifyPath = require('path').resolve(require.resolve('contextify'), '..', '..');
  var contextify = require('bindings')({
    module_root: contextifyPath,
    bindings: 'contextify.node'
  });
  // basic WeakMap shim if not available
  var WM = typeof WeakMap !== 'undefined' ? WeakMap : function WeakMap(){
    var keys = [], values = [];
    return {
      set: function(key, val){
        keys.push(key);
        values.push(val);
        return val;
      },
      get: function(key){
        var index = keys.indexOf(key);
        if (~index) return values[index];
      },
      has: function(key){
        return !!~keys.indexOf(key);
      },
      delete: function(key){
        var index = keys.indexOf(key);
        if (~index) {
          keys.splice(index, 1);
          values.splice(index, 1);
          return true;
        }
        return false;
      }
    };
  };


  // allow for proper garbage collection
  var contexts = new WM;
  var Context = contextify.ContextifyContext;


  function createContext(sandbox){
    if (sandbox == null) {
      sandbox = {};
    } else if (Object(sandbox) !== sandbox) {
      throw new TypeError('Sandbox must be an object');
    }
    contexts.set(sandbox, new Context(sandbox));
    return sandbox;
  }

  function runInContext(code, sandbox){
    if (Object(sandbox) === sandbox) {
      if (!contexts.has(sandbox)) {
        createContext(sandbox);
      }
      return contexts.get(sandbox).run(code);
    } else {
      throw new TypeError('Context must be an object');
    }
  }

  function runInThisContext(code){
    return runInContext(code, global);
  }

  function runInNewContext(code){
    var sandbox = createContext();
    var result = runInContext(code, sandbox);
    dispose(sandbox);
    return result;
  }

  function getGlobal(sandbox) {
    return contexts.get(sandbox).getGlobal();
  }

  function dispose(sandbox){
    contexts.delete(sandbox);
  }

  return {
    createContext: createContext,
    getGlobal: getGlobal,
    runInContext: runInContext,
    runInThisContext: runInThisContext,
    runInNewContext: runInNewContext,
    dispose: dispose
  };
}();

var util = require("util"),
    events = require("events");

var ContextifyVm = function(){};
util.inherits(ContextifyVm, events.EventEmitter);

ContextifyVm.make = function(){
  var vm = new ContextifyVm();
  return vm;
};

ContextifyVm.create = function(){
  var vm = ContextifyVm.make({});
  return vm;
};

ContextifyVm.prototype.execute = function(code, sandbox, async){
  "use strict";

  var self = this;

  var ctx = vm.createContext(sandbox), last_eval;

  var fs = require("fs"),
      path = require("path");

  var bootstrap_file = __dirname + "/context-bootstrap.js";

  var bootstrap_code = fs.readFileSync(bootstrap_file,"utf-8");

  vm.runInContext(bootstrap_code, ctx);

  var response = {};

  async.on("done", function(){
    process.nextTick(function(){
      response.globals = vm.getGlobal(ctx);

      self.emit("execution_complete", response);

      process.nextTick(function(){
        vm.dispose(ctx);
      });
    });        
  });


  try {
    response.evaluation = vm.runInContext("'use strict'; " + code, ctx);
  } catch (e) {
    response.evaluation = e.name + ': ' + e.message;
    response.error = true;
  }

  async.end();
};

exports.contextify_vm = ContextifyVm;
