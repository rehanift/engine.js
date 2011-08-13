var engine = require('./robust').engine;


console.log(process.argv);

var cylinder_id = process.argv[2];

// This is a service that responds to requests
new engine.piston({
    cylinder_id: cylinder_id
});
