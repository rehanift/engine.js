var engine = require("../../engine").engine,
    _ = require("underscore");

var num_to_s = function(some_number){
    return (new Number(some_number)).toString();
};

var run_parameterized_system_test = function(num_clients, tasks_per_client, num_cylinders){
    var identifier = num_to_s(num_clients) + "-" + 
	    num_to_s(tasks_per_client) + "-" +
	    num_to_s(num_cylinders);

    var components = {};
    components['intake'] = engine.intake.create({
	listening_endpoint: "ipc://intake-listener-"+identifier+".ipc",
	sending_endpoint: "ipc://cylinder-listener-"+identifier+".ipc"
    });

    components['exhaust'] = engine.exhaust.create({
	listening_endpoint: "ipc://exhaust-listener-"+identifier+".ipc",
	publishing_endpoint: "ipc://exhaust-publisher-"+identifier+".ipc"
    });

    var clients = {};
    for(var i=1; i<=num_clients; i++){
	clients[num_to_s(i)] = engine.client.create({
	    sending_endpoint: "ipc://intake-listener-"+identifier+".ipc",
	    listening_endpoint: "ipc://exhaust-publisher-"+identifier+".ipc"
	});	
    }
    components['clients'] = clients;

    var cylinders = {};
    for(var j=1; j<= tasks_per_client; j++){
	cylinders[num_to_s(j)] = engine.cylinder.create({
	    listening_endpoint: "ipc://cylinder-listener-"+identifier+".ipc",
	    exhaust_endpoint: "ipc://exhaust-listener-"+identifier+".ipc",
	    piston_script: "./script/piston.js"
	});	
    }
    components['cylinders'] = cylinders;

    var tasks = {}, task, callback, int1, int2;
    _.each(clients, function(client){
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

    waitsFor(function(){
	return _.all(tasks, function(data, task_id){
	    //console.log(task_id, data['callback'].callCount);
	    return data['callback'].callCount > 0;
	});
    },100000);

    runs(function(){
	_.each(tasks, function(data, task_id){
	    expect(data['callback'].mostRecentCall.args[0]).toBe(data['expected_result']);
	    data['task'].done();
	});

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
	run_parameterized_system_test(1,5,1);
    });

    it("runs 5 clients, 5 tasks, and 1 cylinder", function(){
	run_parameterized_system_test(5,5,1);
    });

    it("runs 5 clients, 5 tasks, and 5 cylinders", function(){
	run_parameterized_system_test(5,5,5);
    });

    it("runs 10 clients, 50 tasks, and 10 cylinders", function(){
	run_parameterized_system_test(7,6,7);
    });
});

xdescribe("1 client, 5 tasks, 1 cylinder", function(){
    //var logging_gateway = engine.logging_gateway.create();
    //var stdout_client = engine.logging_stdout_client.create();
    //logging_gateway.add_logger(stdout_client);
    //
    //logging_opts = {
    //	
    //};

    var num_tasks_per_client = 5;

    var components = {};
    components['intake'] = engine.intake.create({
	listening_endpoint: "ipc://intake-listener-1-5-1.ipc",
	sending_endpoint: "ipc://cylinder-listener-1-5-1.ipc"
    });


    components['exhaust'] = engine.exhaust.create({
	listening_endpoint: "ipc://exhaust-listener-1-5-1.ipc",
	publishing_endpoint: "ipc://exhaust-publisher-1-5-1.ipc"
    });

    var clients = {};
    clients['1'] = engine.client.create({
	sending_endpoint: "ipc://intake-listener-1-5-1.ipc",
	listening_endpoint: "ipc://exhaust-publisher-1-5-1.ipc"
    });
    components['clients'] = clients;

    var cylinders = {};
    
    cylinders['1'] = engine.cylinder.create({
	listening_endpoint: "ipc://cylinder-listener-1-5-1.ipc",
	exhaust_endpoint: "ipc://exhaust-listener-1-5-1.ipc",
	piston_script: "./script/piston.js"
    });

    components['cylinders'] = cylinders;

    it("completes", function(){
	var tasks = {}, task, callback, int1, int2;
	_.each(clients, function(client){
	    for(var i = 1; i <= num_tasks_per_client; i++){
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

	waitsFor(function(){
	    return _.all(tasks, function(data, task_id){
		//console.log(task_id, data['callback'].callCount);
		return data['callback'].callCount > 0;
	    });
	});

	runs(function(){
	    _.each(tasks, function(data, task_id){
		expect(data['callback'].mostRecentCall.args[0]).toBe(data['expected_result']);
		data['task'].done();
	    });

	    components['intake'].close();
	    components['exhaust'].close();
	    _.each(components['cylinders'], function(cylinder){
		cylinder.close();
	    });
	    _.each(components['clients'], function(client){
		client.close();
	    });
	});
    });
});

//describe("1 client, 5 tasks, 5 cylinders");

//describe("1 client, 10 tasks, 5 cylinders");