// load the main engine.js library
var engine = require("engine.js").engine;

// create a simple STDOUT logger
var logging_gateway = engine.logging_gateway.create();
var stdout_client = engine.logging_stdout_client.create();
logging_gateway.add_logger(stdout_client);

var logging_opts = {
    logging_gateway: logging_gateway
};

// create server components (with STDOUT logger)
var intake = engine.intake.create(logging_opts);
var exhaust = engine.exhaust.create(logging_opts);
var cylinder = engine.cylinder.create(logging_opts);