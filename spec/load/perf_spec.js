var engine = require("../../engine").engine,
    _ = require("underscore"),
    helpers = require("../helpers/component_factories").helpers;

var run_parameterized_system_test = function(scheme, num_clients, tasks_per_client, num_cylinders){
    
    var components = {};
    runs(function(){
	if (scheme == "tcp") {
	    components['intake'] = helpers.create_tcp_intake(5555, 5556);
	    components['exhaust'] = helpers.create_tcp_exhaust(5557, 5558);
	    components['clients'] = helpers.create_tcp_clients(num_clients, 5555, 5558);
	    components['cylinders'] = helpers.create_tcp_cylinders(num_cylinders, 5556, 5557);
	} else if (scheme == "ipc") {
	    var identifier = helpers.num_to_s(num_clients) + "-" + 
	     helpers.num_to_s(tasks_per_client) + "-" +
	     helpers.num_to_s(num_cylinders);

	    components['intake'] = helpers.create_ipc_intake(identifier);
	    components['exhaust'] = helpers.create_ipc_exhaust(identifier);
	    components['clients'] = helpers.create_ipc_clients(num_clients, identifier);
	    components['cylinders'] = helpers.create_ipc_cylinders(num_cylinders, identifier);
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