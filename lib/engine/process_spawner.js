var process_spawner = function(strategy){
    this.strategy = strategy;
};

process_spawner.make = function(options){
    return new process_spawner(options.strategy);
};

process_spawner.create = function(config){    
    var path = require("path");

    if (typeof config.file == "undefined") {
    	throw "The name of a file is needed to spawn a new process";
    }

    if (path.exists(config.file)) {
    	throw "The file at '"+config.file+"' does not exist";
    }

    return process_spawner.make({
        strategy: function(){
            var spawn = require("child_process").spawn;
            return spawn('node', [config.file].concat(config.args));
        }
    });
};

process_spawner.prototype.spawn = function(){
    return this.strategy.call();
};

exports.process_spawner = process_spawner;