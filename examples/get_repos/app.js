var fs = require("fs");

var engine = require("../../engine.js").engine;
var client = engine.client.create();

var task = client.createTask();

// Define the global context for the user-code to run in
var context = fs.readFileSync(__dirname + "/context.js","utf-8");
task.setContext(context);

// Define the user-code
var code = fs.readFileSync(__dirname + "/code.js","utf-8");
task.setCode(code);        

task.on('eval', function(err, response){
  if(err){
    console.error("An error was encountered while *trying* to execute your task -",err);
    client.close();
    return false;
  }

  if(response.isError()) {
    console.error("An error was encountered while *executing* your task -", response.getEvaluation());
  } 
  
  console.log("Task response global variables -", response.getGlobals());

  client.close();
});

task.run();