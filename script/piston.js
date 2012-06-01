var engine = require('../engine').engine;

//////////////////////////////////////////////////////////////////////
//          LEAVE THESE CHANGES TO THE FUNCTION PROTOTYPE           //
//////////////////////////////////////////////////////////////////////

Function.prototype.constructor = function(){ throw new SecurityError("The Function constructor may not be called"); };
Function.prototype.toString = function(){ throw new SecurityError("'toString' may not be called on functions"); };

var SecurityError = function(message){
  this.message = message;
  this.name = "SecurityError";
};
SecurityError.prototype = Error.prototype;

var cylinder_id = process.argv[2];
var console_endpoint = process.argv[3];

// This is a service that responds to requests
var piston = engine.piston.create({
  listening_endpoint: "ipc:///tmp/"+cylinder_id+".ipc",
  cylinder_id: cylinder_id,
  console_endpoint: console_endpoint
});

process.on('SIGTERM', function(){
  console.log("closing piston");
  piston.close();
});

process.on("uncaughtException", function(err){
  console.error(err);
  process.exit(2);
});
