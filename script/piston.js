var engine = require('../engine').engine;

//console.log(process.argv);

var cylinder_id = process.argv[2];

// This is a service that responds to requests
var piston = new engine.piston();

piston.server.start("ipc://compression-"+cylinder_id+".ipc", function(){
    console.log("piston server is running");
});