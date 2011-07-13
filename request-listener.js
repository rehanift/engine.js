var connect = require('connect'),
    spawn = require('child_process').spawn,
    context = require('zeromq');

function WaitingResponse(res) {
    WaitingResponse.counter++;
    this.id = WaitingResponse.counter;
    WaitingResponse.pool[this.id] = res;
    return this.id;
}

WaitingResponse.counter = 0;
WaitingResponse.pool = {};

WaitingResponse.get = function(id) {
    var res = WaitingResponse.pool[id];
    //delete WaitingResponse.pool[id];
    return res;
};


var code_sender = context.createSocket("push");
var results_receiver = context.createSocket("pull");
results_receiver.on("message", function(data){
    console.log("Results: " + data);
    var results = JSON.parse(data);
    if (results) {
	var res = WaitingResponse.get(results.res_id.id);
	if (res) {
	    res.end();
	}
    }
});

results_receiver.bind("ipc://results.ipc", function(err){
    if (err) throw err;

    console.log("Results Reciever Connected!");
});

code_sender.bind("ipc://code.ipc", function(err){
    if (err) throw err;
    
    console.log("Code Sender Connected!");
    code_sender.send("0");
});



var logger = connect.logger(),
    router;

var response_lounge = {};

router = connect.router(function(app) {
    app.get("/user/:id", function(req, res, next){
	console.log("User ID:",req.params.id);
	var res_id = new WaitingResponse(res);
	var payload = {
	    res_id: res_id,
	    params: req.params
	};
	code_sender.send(JSON.stringify(payload));
    });
});


function ChildProcess(id) {
    this.id = id;
    this.process = spawn('node',["child_process.js"]);
}

var child_processes = [];
var num_child_processes = 3;
var proc;
for (var i = 0; i < num_child_processes; i++) {
    proc = new ChildProcess(i);
    child_processes.push(proc);
    console.log(proc.process.pid);
}


connect.createServer(logger,router).listen(3000);

//
//
//
//
//
//
//// sandbox.js - Rudimentary JS sandbox
//// Gianni Chiappetta - gf3.ca - 2010
//// Rehan Iftikhar - anarrayofbytes.com - 2011
//
///*------------------------- INIT -------------------------*/
//var fs = require( 'fs' )
//  , path = require( 'path' )
//  , spawn = require( 'child_process' ).spawn;
//
///*------------------------- Sandbox -------------------------*/
//function Sandbox( options ) {
//  ( this.options = options || {} ).__proto__ = Sandbox.options;
//  
//  this.run = function( code, hollaback ) {
//    // Any vars in da house?
//    var timer
//      , stdout = { value : "" }
//      , stderr = { value : "" }
//      , child = spawn( this.options.node, [this.options.shovel] )
//      , streamAccumulator = function(incoming_data, data_holder){
//	  if ( !!incoming_data ) {
//	      data_holder.value += incoming_data;
//	  }
//      }
//      , payload = {
//	  code: code,
//	  context: this.options.context,
//	  applier: this.options.applier,
//	  runtime_data: this.options.runtime_data
//      };
//
//    // Listen
//    child.stdout.on( 'data', function(data){
//	streamAccumulator(data, stdout);
//    });
//    child.stderr.on( 'data', function(data){
//	streamAccumulator(data, stderr);	
//    });
//    child.on( 'exit', function( code ) {
//	clearTimeout( timer );    	
//	hollaback.call( this, JSON.parse( stdout.value ) );	
//    });
//
//    // Go      
//    child.stdin.write( JSON.stringify(payload) );
//    child.stdin.end();
//    timer = setTimeout( function() {
//      child.stdout.removeAllListeners('data');
//      stdout.value = JSON.stringify( { result: 'TimeoutError', console: [] } );
//      child.kill( 'SIGKILL' );
//    }, this.options.timeout );
//  };
//}
//
//// Options
//Sandbox.options =
//  { timeout: 500
//  , node: 'node'
//  , shovel: path.join( __dirname, 'shovel.js' )
//  , context: fs.readFileSync(path.join( __dirname, '..', 'etc', 'contexts', 'default.js' ), 'utf-8')
//  , applier: fs.readFileSync(path.join( __dirname, '..', 'etc', 'appliers', 'default.js' ), 'utf-8')
//  , runtime_data: {}
//  };
//
//// Info
//fs.readFile( path.join( __dirname, '..', 'package.json' ), function( err, data ) {
//  if ( err )
//    throw err;
//  else
//    Sandbox.info = JSON.parse( data );
//});
//
///*------------------------- Export -------------------------*/
//module.exports = Sandbox;