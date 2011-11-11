var engine = function(){};

engine.client = require("./lib/engine/client").client;
engine.cylinder = require("./lib/engine/cylinder").cylinder;
engine.piston = require("./lib/engine/piston").piston;
engine.util = require("./lib/engine/util");
engine.intake = require("./lib/engine/intake").intake;
engine.exhaust = require("./lib/engine/exhaust").exhaust;
engine.logging_gateway = require("./lib/engine/logger/logging_gateway").logging_gateway;
engine.logging_client = require("./lib/engine/logger/logging_client").logging_client;
engine.logging_stdout_client = require("./lib/engine/logger/stdout_logging_client").stdout_client;
engine.log_message = require("./lib/engine/logger/log_message").log_message;

exports.engine = engine;