var context = require('zeromq'),
    util = require("util");

var code_receiver = context.createSocket("pull");
var results_sender = context.createSocket("push");
code_receiver.connect("ipc://code.ipc");

results_sender.connect("ipc://results.ipc");

code_receiver.on("message", function(data){
    setTimeout(function(){
	results_sender.send(data);
    }, 3000);
});

results_sender.send("0");





//results_sender.close();
//receiver.close();
