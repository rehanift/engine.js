var engine = require("../engine").engine;

var client = engine.client.create();
var task = client.createTask();

task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
task.setLocals({});
task.setCode("add(1,1)");
task.setCode("console.log('foo')");

task.run(function(data){
  console.log(data);
});
