var piston = function(execution_strategy, console_socket, sandbox_generator){
    this.execution_strategy = execution_strategy;
    this.console_socket = console_socket;
    this.sandbox_generator = sandbox_generator;
};

piston.make = function(options){
    var new_piston = new piston(options.execution_strategy,
                                options.console_socket,
                                options.sandbox_generator);
    
    new_piston.server = piston.server.make({
        piston: new_piston,
        socket: options.server_socket
    });

    return new_piston;
};

piston.create = function(options){
    var execution_strategy = piston.execution_strategies.node_vm.make();
    
    var context = require("zeromq");
    var console_socket = context.createSocket("push");
    console_socket.connect("ipc://exhaust_collector.ipc");

    var server_socket = context.createSocket("rep");
    server_socket.bind(options.listening_endpoint, function(err){
        if (err) throw err;        
    });

    return piston.make({
        server_socket: server_socket,
        console_socket: console_socket,
        sandbox_generator: piston.sandboxGenerator.make(),
        execution_strategy: execution_strategy
    });
};

piston.prototype.process_request = function(request){
    var params = JSON.parse(request);
    var sandbox = this.sandbox_generator.generate(this.console_socket,
                                                  params['context'],
                                                  params['locals'],
                                                  params['task_id']);
    
    var last_eval = this.execution_strategy.execute(params['code'], sandbox);
    return JSON.stringify({
        task_id: params['task_id'],
        last_eval: last_eval
    });
};

var execution_strategies = {
    node_vm: require("./execution_strategies/node_vm").node_vm
};
piston.execution_strategies = execution_strategies;
piston.sandboxGenerator = require("./sandbox_generator").sandboxGenerator;
piston.server = require("./piston_server").pistonServer;

exports.piston = piston;