var engine = require('./robust').engine;


console.log(process.argv);

var cylinder_id = process.argv[2];

new engine.piston({
    cylinder_id: cylinder_id
});