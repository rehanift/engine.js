var robust = require('./robust').robust;

/* 
 robust.js is a framework for safely and easily running user-code

 safe = user code is run in separate child process
 safe = user code can only run for a certain amount of time
 safe = user code will only have access to defined scope and runtime data

 easy = developer just needs to define the scope and run user code
 against it.
*/

var client_options = {
    num_children: 1
};
var client = new robust(client_options); // spin up child processes

//client.on("ready", function(){
//    console.log("Runner is ready");
//    setInterval(function(){
//	var task = client.createTask(); // create and return a task object. Tasks are EventEmitters.
//	var options = {
//	    context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
//	    locals: "",
//	    code: "add(1,1)"
//	};
//	task.run(options, function(data){ console.log(data); });
//    }, 2000);
//});

client.on("ready", function(){
    setInterval(function(){
	var task = client.createTask();
	var delay = Math.random() * 10000;
	task.run({
	    context:"(function(locals){ return { wait: function(){setTimeout(function(){ return 'done';}, locals.delay);} } })",
	    locals:{ delay:delay },
	    code:"wait();"
	});

	task.on("complete",function(data){
	    //console.log(data);
	});

    }, 1000);
});

//// ... or ...
//
//task.on("complete", function(data){
//    console.log(data);
//});
