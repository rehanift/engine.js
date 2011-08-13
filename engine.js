var engine = function(){};

engine.constants = require("./lib/engine/constants").constants;
engine.task = require("./lib/engine/task").task;
engine.client = require("./lib/engine/client").client;
engine.process = require("./lib/engine/process").process;
engine.cylinder = require("./lib/engine/cylinder").cylinder;
engine.piston = require("./lib/engine/piston").piston;

exports.engine = engine;