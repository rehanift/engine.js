var sandboxGenerator = function(console_socket, context, locals){
    var self = this;
    self.console_socket = console_socket;
    self.context = context;
    self.locals = locals;
};

sandboxGenerator.make = function(options){
    var my_sandbox_gen = new sandboxGenerator(options.console_socket,
                                              options.context,
                                              options.locals);

    return my_sandbox_gen;
};

sandboxGenerator.create = function(options){
    return sandboxGenerator.make();
};

sandboxGenerator.prototype.generate = function(){
    var self = this;

    // TODO: error handling
    var sandbox = (eval(self.context))(self.locals);

    // TODO: console#end
    var console = {
        log: function(data){
            var util = require("util");
            self.console_socket.send(util.inspect(data));
        }
    };

    sandbox.console = console;
    
    return sandbox;
};

exports.sandboxGenerator = sandboxGenerator;