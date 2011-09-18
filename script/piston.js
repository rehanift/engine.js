var engine = require('../engine').engine;

console.log(process.argv);

var cylinder_id = process.argv[2];

// This is a service that responds to requests
var piston = engine.piston.create({
  listening_endpoint: "ipc://"+cylinder_id+".ipc",
  cylinder_id: cylinder_id
});

process.on('SIGTERM', function(){
    console.log("closing piston");
    piston.close();
});
