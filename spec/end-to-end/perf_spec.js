var engine = require("../../engine").engine,
    _ = require("underscore");

var num_to_s = function(some_number){
    return (new Number(some_number)).toString();
};

var logging_gateway = engine.logging_gateway.create();
var stdout_client = engine.logging_stdout_client.create();
//logging_gateway.add_logger(stdout_client);

var create_tcp_intake = function(listening_port, sending_port){
    return engine.intake.create({
	listening_endpoint: "tcp://*:"+listening_port,
	sending_endpoint: "tcp://*:"+sending_port,
	logging_gateway: logging_gateway
    });
};

var create_tcp_exhaust = function(listening_port, publishing_port){
    return engine.exhaust.create({
	listening_endpoint: "tcp://*:"+listening_port,
	publishing_endpoint: "tcp://*:"+publishing_port,
	logging_gateway: logging_gateway
    });
};

var create_ipc_intake = function(identifier){
    return engine.intake.create({
	listening_endpoint: "ipc://intake-listener-"+identifier+".ipc",
	sending_endpoint: "ipc://cylinder-listener-"+identifier+".ipc",
	logging_gateway: logging_gateway
    });
};

var create_ipc_exhaust = function(identifier){
    return engine.exhaust.create({
	listening_endpoint: "ipc://exhaust-listener-"+identifier+".ipc",
	publishing_endpoint: "ipc://exhaust-publisher-"+identifier+".ipc",
	logging_gateway: logging_gateway
    });
};

var create_tcp_clients = function(num, sending_port, listening_port){
    var clients = {};
    for(var i=1; i<=num; i++){
	clients[num_to_s(i)] = engine.client.create({
	    sending_endpoint: "tcp://127.0.0.1:"+sending_port,
	    listening_endpoint: "tcp://127.0.0.1:"+listening_port
	});	
    }
    return clients;
};

var create_ipc_clients = function(num, identifier){
    var clients = {};
    for(var i=1; i<=num; i++){
	clients[num_to_s(i)] = engine.client.create({
	    sending_endpoint: "ipc://intake-listener-"+identifier+".ipc",
	    listening_endpoint: "ipc://exhaust-publisher-"+identifier+".ipc"
	});	
    }
    return clients;
};

var create_tcp_cylinders = function(num, listening_port, exhaust_port){
    var cylinders = {};
    for(var i=1; i<=num; i++){
	cylinders[num_to_s(i)] = engine.cylinder.create({
	    listening_endpoint: "tcp://127.0.0.1:"+listening_port,
	    exhaust_endpoint: "tcp://127.0.0.1:"+exhaust_port,
	    piston_script: "./script/piston.js",
	    logging_gateway: logging_gateway
	});	
    }
    return cylinders;
};

var create_ipc_cylinders = function(num, identifier){
    var cylinders = {};
    for(var i=1; i<=num; i++){
	cylinders[num_to_s(i)] = engine.cylinder.create({
	    listening_endpoint: "ipc://cylinder-listener-"+identifier+".ipc",
	    exhaust_endpoint: "ipc://exhaust-listener-"+identifier+".ipc",
	    piston_script: "./script/piston.js",
	    logging_gateway: logging_gateway
	});	
    }
    return cylinders;
};


var run_parameterized_system_test = function(scheme, num_clients, tasks_per_client, num_cylinders){
    
    var components = {};
    runs(function(){
	if (scheme == "tcp") {
	    components['intake'] = create_tcp_intake(5555, 5556);
	    components['exhaust'] = create_tcp_exhaust(5557, 5558);
	    components['clients'] = create_tcp_clients(num_clients, 5555, 5558);
	    components['cylinders'] = create_tcp_cylinders(num_cylinders, 5556, 5557);
	} else if (scheme == "ipc") {
	    var identifier = num_to_s(num_clients) + "-" + 
	     num_to_s(tasks_per_client) + "-" +
	     num_to_s(num_cylinders);

	    components['intake'] = create_ipc_intake(identifier);
	    components['exhaust'] = create_ipc_exhaust(identifier);
	    components['clients'] = create_ipc_clients(num_clients, identifier);
	    components['cylinders'] = create_ipc_cylinders(num_cylinders, identifier);
	} else {
	    throw "'scheme' must be either 'ipc' or 'tcp'";
	}
    });
    
    waits(1000);

    var tasks = {}, task, callback, int1, int2;
    runs(function(){
	_.each(components['clients'], function(client){
	    for(var i = 1; i <= tasks_per_client; i++){
		int1 = Math.random(0,100);
		int2 = Math.random(0,200);
		task = client.createTask();
		task.setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
		task.setLocals({});	    
		task.setCode("add("+int1+","+int2+")");
		callback = jasmine.createSpy();
		task.on('eval', callback);
		tasks[task.id] = {};
		tasks[task.id]['task'] = task;
		tasks[task.id]['callback'] = callback;
		tasks[task.id]['expected_result'] = int1+int2;
		task.run();
	    }
	});
    });

    waitsFor(function(){
	return _.all(tasks, function(data, task_id){
	    return data['callback'].callCount > 0;
	});
    },100000);

    runs(function(){
	_.each(tasks, function(data, task_id){
	    expect(data['callback'].mostRecentCall.args[0]).toBe(data['expected_result']);
	});
    });    

    runs(function(){
	components['intake'].close();
	components['exhaust'].close();
	_.each(components['cylinders'], function(cylinder){
	    cylinder.close();
	});
	_.each(components['clients'], function(client){
	    client.close();
	});
    });
};  

describe("Parameterized system test", function(){    
    it("runs 1 client, 5 tasks, and 1 cylinder", function(){
	run_parameterized_system_test('tcp',1,5,1);
	run_parameterized_system_test('ipc',1,5,1);
    });

    it("runs 5 clients, 5 tasks, and 1 cylinder", function(){
	run_parameterized_system_test('tcp',5,5,5);
	run_parameterized_system_test('ipc',5,5,1);
    });

    it("runs 5 clients, 5 tasks, and 5 cylinders", function(){
	run_parameterized_system_test('tcp',5,5,5);
	run_parameterized_system_test('ipc',5,5,5);
    });

    it("runs 10 clients, 50 tasks, and 10 cylinders", function(){
	run_parameterized_system_test('tcp',10,50,10);
	run_parameterized_system_test('ipc',10,50,10);
    });

    it("runs 50 clients, 5 tasks, and 10 cylinders", function(){
	run_parameterized_system_test('tcp',50,5,10);
	run_parameterized_system_test('ipc',50,5,10);
    });

    it("runs 50 clients, 50 tasks, and 50 cylinders", function(){
	run_parameterized_system_test('tcp',50,50,10);
	run_parameterized_system_test('ipc',50,50,10);
    });
});