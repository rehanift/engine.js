var util = require("util"),
    events = require("events");

var AsyncCallbackRegister = function(){
  this.count = 0;
};
util.inherits(AsyncCallbackRegister,events.EventEmitter);

AsyncCallbackRegister.make = function(){
  var async = new AsyncCallbackRegister();
  return async;
};

AsyncCallbackRegister.create = function(){
  var async = AsyncCallbackRegister.make({});
  return async;
};

AsyncCallbackRegister.prototype.start = function(){
  this.count++;
};
AsyncCallbackRegister.prototype.end = function(){
  this.count--;

  if(this.count <= 0) {
    this.emit("done");
  }
};


module.exports = AsyncCallbackRegister;