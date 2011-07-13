var robust = require('./robust').robust;

console.log(process.argv);

var process_id = process.argv[2];

new robust.worker({
    process_id: process_id
});

//var context = require('zeromq'),
//    util = require("util"),
//    vm = require("vm");
//
//// TODO: encapsulate this into the robust lib
//
//var code_receiver = context.createSocket("pull");
//var results_sender = context.createSocket("push");
//var result, returned_data;
//
//code_receiver.connect("ipc://code.ipc");
//results_sender.connect("ipc://results.ipc");
//
//code_receiver.on("message", function(data){
//    if (data == "0") {
//	results_sender.send("1");
//	return true;
//    }
//    
//    var config = JSON.parse(data);
//    var code = config['code'];
//    var context = config['context'];
//    var locals = config['locals'];
//    var task_id = config['task_id'];
//    
//    var sandbox = (eval(context))(locals);
//    
//    var results = run(code, sandbox);
//    
//    var response = {
//    	task_id: task_id,
//    	returned_data: results[0],
//    	context: results[1]
//    };
//    
//    results_sender.send(JSON.stringify(response));
//});
//
//results_sender.send("0");
//
//function run(code, context) {
//    return (function(code) {
//	try {
//	    returned_data = vm.runInNewContext(this.toString(), context);
//	}
//	catch (e) {
//	    returned_data =  e.name + ': ' + e.message;
//	}
//	
//	return [returned_data, context];
//    }).call(code);
//    
//    // NOTE: do we still need this if we aren't using STDIN/STDOUT?
//    // process.stdout.on( 'drain', function() {
//    // 	process.exit(0);
//    // });
//
//    // process.stdout.write(applier.call(this, result));
//}




//results_sender.close();
//receiver.close();
