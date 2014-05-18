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

    var tasks = {}, task, callback, int1, int2, start_time, end_time, done = 0, task_id;
    runs(function(){
	_.each(components['clients'], function(client, client_id){
	    for(var i = 1; i <= tasks_per_client; i++){
		int1 = Math.random(0,100);
		int2 = Math.random(0,200);
                task_id = client_id + "_" + (new Number(i)).toString();
		tasks[task_id] = {};
		tasks[task_id]['task'] = client.createTask();
		tasks[task_id]['expected_result'] = int1+int2;
		tasks[task_id]['task'].setContext("(function(locals){ return { add: function(a,b){ return a+b; } } })");
		tasks[task_id]['task'].setLocals({});	    
		tasks[task_id]['task'].setCode("index = '"+task_id+"'; add("+int1+","+int2+")");
                tasks[task_id]['task'].on('eval', function(err, response){
                    if (err) throw err;
                    done++;
                    var globals = response.getGlobals();
                    tasks[globals.index]['actual_result'] = response.getEvaluation();
                    tasks[globals.index]['task'] = null;
                });
	    }
	});

        start_time = new Date();

        _.each(tasks, function(scheduled_task){
            scheduled_task["task"].run();
        });
    });

    waitsFor(function(){
	return done == tasks_per_client * num_clients;
    },100000);

    runs(function(){
        end_time = new Date();
	_.each(tasks, function(data, task_id){
	    expect(data['actual_result']).toBe(data['expected_result']);
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
	report_results(scheme, num_clients, tasks_per_client, num_cylinders, start_time, end_time);
    });

    waits(5000);
};  

var report_results = function(transport_scheme, num_clients, tasks_per_client, num_cylinders, start_time, end_time){
    var total_tasks = num_clients * tasks_per_client;
    var total_time = (end_time - start_time) / 1000;
    var tasks_per_second = total_tasks / total_time;

    console.log("\n["+transport_scheme+"] " + total_tasks + " tasks from " + 
		num_clients + " clients against " + num_cylinders + " cylinders " +
		"completed in " + total_time + " seconds " + 
		"(" + Math.floor(tasks_per_second) + " tps)");
};

describe("Many simple addition tasks", function(){
    describe("from one client", function(){
	it("with 1 cylinder", function(){
            run_parameterized_system_test('tcp',1,1000,1);
            run_parameterized_system_test('ipc',1,1000,1);
	});

	it("with 2 cylinders", function(){
            run_parameterized_system_test('tcp',1,1000,2);
            run_parameterized_system_test('ipc',1,1000,2);
	});

	it("with 4 cylinders", function(){
            run_parameterized_system_test('tcp',1,1000,4);
            run_parameterized_system_test('ipc',1,1000,4);
	});

	it("with 8 cylinders", function(){
            run_parameterized_system_test('tcp',1,1000,8);
            run_parameterized_system_test('ipc',1,1000,8);
	});

	it("with 16 cylinders", function(){
            run_parameterized_system_test('tcp',1,1000,16);
            run_parameterized_system_test('ipc',1,1000,16);
	});
    });

    describe("from many clients", function(){
	it("with 1 cylinder", function(){
            run_parameterized_system_test('tcp',31,31,1);
            run_parameterized_system_test('ipc',31,31,1);
	});

	it("with 2 cylinders", function(){
            run_parameterized_system_test('tcp',31,31,2);
            run_parameterized_system_test('ipc',31,31,2);
	});

	it("with 4 cylinders", function(){
            run_parameterized_system_test('tcp',31,31,4);
            run_parameterized_system_test('ipc',31,31,4);
	});

	it("with 8 cylinders", function(){
            run_parameterized_system_test('tcp',31,31,8);
            run_parameterized_system_test('ipc',31,31,8);
	});

	it("with 16 cylinders", function(){
            run_parameterized_system_test('tcp',31,31,16);
            run_parameterized_system_test('ipc',31,31,16);
	});
    });

});