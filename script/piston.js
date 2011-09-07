var engine = require('../engine').engine;

console.log(process.argv);

var cylinder_id = process.argv[2];

// This is a service that responds to requests
var piston = engine.piston.create({
  listening_endpoint: "ipc://"+cylinder_id+".ipc"
});

process.on('SIGTERM', function(){
    piston.close();
});
