var sandbox_generator = function(){};

sandbox_generator.make = function(){
    var my_sandbox_gen = new sandbox_generator();

    return my_sandbox_gen;
};

sandbox_generator.create = function(){
    return sandbox_generator.make();
};

sandbox_generator.prototype.generate = function(console_socket, context, locals, task_id){
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

exports.sandbox_generator = sandbox_generator;