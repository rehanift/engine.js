var sandbox_generator = require("./piston/sandbox_generator").sandbox_generator;

var execution_strategies = {
    node_vm: require("./piston/execution_strategies/node_vm").node_vm,
    contextify_vm: require("./piston/execution_strategies/contextify_vm").contextify_vm
};

var piston = function(execution_strategy, console_socket, result_socket, server_socket, sandbox_generator){
    this.execution_strategy = execution_strategy;
    this.console_socket = console_socket;
    this.result_socket = result_socket;
    this.server_socket = server_socket;
    this.sandbox_generator = sandbox_generator;
};

piston.make = function(options){
    var new_piston = new piston(options.execution_strategy,
                                options.console_socket,
                                options.result_socket,
                                options.server_socket,
                                options.sandbox_generator);
    
    new_piston.server_socket.on("message", function(data){
        var task = JSON.parse(data.toString());
        var results = new_piston.process_request(task);
        new_piston.result_socket.send(results);
    });

    return new_piston;
};

piston.create = function(config){
    var provide_defaults = require("./helpers/provide_defaults");
    var options = provide_defaults(config, {
	console_endpoint: config.console_endpoint
    });
    
    //var execution_strategy = piston.execution_strategies.node_vm.make();
    var execution_strategy = execution_strategies.contextify_vm.create();
    
    var context = require("zmq");
    var console_socket = context.socket("push");
    console_socket.connect(options.console_endpoint);

    var server_socket = context.socket("pull");
    server_socket.connect(options.listening_endpoint);

    var result_socket = context.socket("push");
    result_socket.connect("ipc:///tmp/results-"+options.cylinder_id+".ipc");

    return piston.make({
        server_socket: server_socket,
        result_socket: result_socket,
        console_socket: console_socket,
        sandbox_generator: sandbox_generator.create(),
        execution_strategy: execution_strategy
    });
};

piston.prototype.process_request = function(task){
    var json_safe = require("../jsonify");

    var sandbox = this.sandbox_generator.generate(this.console_socket,
                                                  task['context'],
                                                  task['locals'],
                                                  task['task_id']);
    
    var response = this.execution_strategy.execute(task['code'], sandbox);

    //TODO: what if last_eval causes stringify to break?

    return json_safe.stringify({
        task_id: task['task_id'],
        response: response
    });
};

piston.prototype.close = function(){
    this.console_socket.close();
    this.result_socket.close();
    this.server_socket.close();
};

exports.piston = piston;
