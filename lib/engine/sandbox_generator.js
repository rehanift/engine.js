var sandboxGenerator = function(){};

sandboxGenerator.make = function(){
    var my_sandbox_gen = new sandboxGenerator();

    return my_sandbox_gen;
};

sandboxGenerator.create = function(options){
    return sandboxGenerator.make();
};

sandboxGenerator.prototype.generate = function(console_socket, context, locals){
    // TODO: error handling
    var sandbox = (eval(context))(locals);

    // TODO: console#end
    var console = {
        log: function(data){
            var util = require("util");
            console_socket.send(util.inspect(data));
        }
    };

    sandbox.console = console;
    
    return sandbox;
};

exports.sandboxGenerator = sandboxGenerator;