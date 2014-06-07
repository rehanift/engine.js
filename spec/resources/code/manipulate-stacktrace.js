Error.prepareStackTrace = function(error, stack){
  return "EXPLOIT!";
};

Error.stackTraceLimit = 10;

var foo = function(){
  var e = new Error();
  return e.stack;
};

foo();