var sandboxGenerator = function(){};

sandboxGenerator.make = function(){
    var my_sandbox_gen = new sandboxGenerator();

    return my_sandbox_gen;
};

sandboxGenerator.create = function(){
    return sandboxGenerator.make();
};

sandboxGenerator.prototype.generate = function(console_socket, context, locals, task_id){
    // TODO: error handling
    var sandbox = (eval(context))(locals);

    // TODO: console#end
    var console = {
        log: function(data){
            var util = require("util");
            var payload = {
                task_id: task_id,
                console: util.inspect(data)
            };
            console_socket.send(JSON.stringify(payload));
        }
    };

    sandbox.console = console;
    
    return sandbox;
};

exports.sandboxGenerator = sandboxGenerator;