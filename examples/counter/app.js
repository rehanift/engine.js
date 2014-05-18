var fs = require("fs");

var engine = require("../../engine.js").engine;
var client = engine.client.create();

var task = client.createTask();

// Define the global context for the user-code to run in
var context = fs.readFileSync(__dirname + "/context.js","utf-8");
task.setContext(context);

// Define the task-specific run-time variables
task.setLocals({
    start_value: 5
});

// Define the user-code
var code = fs.readFileSync(__dirname + "/code.js","utf-8");
task.setCode(code);        

task.on('eval', function(err, response){
    if(err){
        console.log("An error was encountered while *trying* to execute your task");
        throw err;
    }

    if(response.isError()) {
        console.log("An error was encountered while *executing* your task");
        console.log(response.getEvaluation());
        
        return;
    } 

    console.log("Your task completed successfully");
    console.log("Evaluation: ", response.getEvaluation());
    console.log("Globals: ", response.getGlobals());
});

task.on('output', function(data){
    console.log(data);
});

// no more events to be emitted on task
task.on('end', function(){
  console.log("Task finished...");
    client.close();
});

task.run();