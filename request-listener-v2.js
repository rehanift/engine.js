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
    num_children: 0
};
var client = new robust(client_options); // spin up child processes

//client.on("ready", function(){
//    console.log("Runner is ready");
//    var task = client.createTask(); // create and return a task object. Tasks are EventEmitters.
//    var options = {
//	context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
//	locals: "",
//	code: "add(1,1)"
//    };
//    task.run(options, function(data){ console.log(data); });
//});

//client.on("ready", function(){
//    var task = client.createTask();
//    var delay = Math.random() * 10000;
//    task.run({
//	context:"(function(locals){ return { wait: function(){setTimeout(function(){ return 'done';}, locals.delay);} } })",
//	locals:{ delay:delay },
//	code:"wait();"
//    });    
//    
//    task.on("complete", function(data){
//	console.log("task done");
//    });
//
//    var task2 = client.createTask();
//    var delay2 = Math.random() * 10000;
//    task2.run({
//	context:"(function(locals){ return { wait: function(){setTimeout(function(){ return 'done';}, locals.delay);} } })",
//	locals:{ delay:delay2 },
//	code:"wait();"
//    });  
//    task2.on("complete", function(data){
//	console.log("task2 done");
//    });  
//});


client.on("ready", function(){
    setInterval(function(){
	var task = client.createTask();
	//var delay = Math.random() * 10000;
	var delay = 10000;
	task.run({
	    context:"(function(locals){ return { sleep: function() { var now = new Date().getTime(); while(new Date().getTime() < now + locals.delay) { /* sleep */ } return 'selpt for ' + locals.delay;} } })",
	    locals:{ delay:delay },
	    code:"sleep();"
	});    
	
	task.on("complete", function(data){
	    console.log("task done ", delay);
	});

    }, 1000);
});

//// ... or ...
//
//task.on("complete", function(data){
//    console.log(data);
//});


