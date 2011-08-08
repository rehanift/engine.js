var engine = require("../robust.js").engine,
    spawn = require("child_process").spawn;

var getPistonProcesses = function(callback){
    var ps = spawn("ps",["ax","-o","pid,command"]);
    var grep = spawn("grep",["piston"]);
    var excludeGrep = spawn("grep",["-v","grep"]);
    ps.stdout.on("data", function(data){
	grep.stdin.write(data);
    });

    grep.stdout.on("data", function(data){
	excludeGrep.stdin.write(data);
    });

    excludeGrep.stdout.on("data", callback);
    
    ps.on("exit", function(){
	grep.stdin.end();
    });

    grep.on("exit", function(){
	excludeGrep.stdin.end();
    });

};

describe("Cylinder", function(){
    it("has a unique ID", function(){
	var myCylinder1 = new engine.cylinder();
	var myCylinder2 = new engine.cylinder();

	expect(myCylinder1.id).toBeTruthy();
	expect(myCylinder1.id).not.toEqual(myCylinder2.id);
	myCylinder1.close();
	myCylinder2.close();
    });

    it("spawns a new Piston process", function(){
	var myCylinder = new engine.cylinder();
	var callback = jasmine.createSpy();

	getPistonProcesses(callback);

	waitsFor(function(){
	    return callback.callCount > 0;
	});

	runs(function(){
	    expect(callback.mostRecentCall.args[0].toString()).toContain(myCylinder.id);
	    myCylinder.close();
	});	
    });

    it("kills and restarts it's Piston process if it runs longer than a specified amount of time", function(){
	var myCylinder;
	var callback = jasmine.createSpy();
	var originalPid;

	var context = require('zeromq');
	var mockPiston = context.createSocket("rep");

	mockPiston.bind("ipc://spec.ipc", function(err){
	    if (err) throw err;
	    myCylinder = new engine.cylinder({
		compression:{
		    endpoint: "ipc://spec.ipc",
		    timeout: 1000
		}
	    });

	    originalPid = myCylinder.pistonProcess.process.pid;

	    myCylinder.ignite("foo");
	});

	mockPiston.on("message", function(data){
	    var now = new Date().getTime(); 
	    while(new Date().getTime() < now + 5000) { /* sleep */ }
	    mockPiston.send(data);
	});

	waits(5000);

	runs(function(){
	    var restartedPid = myCylinder.pistonProcess.process.pid;
	    expect(restartedPid).not.toEqual(originalPid);
	    expect(restartedPid).toBeTruthy();
	    myCylinder.close();
	    mockPiston.close();
	});
    });

    describe("intake socket", function(){
	it("accepts messages from a zeromq pull socket", function(){
	    var callback = jasmine.createSpy();
	    var myCylinder;

	    var context = require("zeromq");
	    var codePush = context.createSocket("push");
	    var pistonSocket = context.createSocket("rep");

	    pistonSocket.bind("ipc://piston.ipc", function(err){
		if(err) throw err;
		
		codePush.bind("ipc://spec.ipc", function(err){
		    if(err) throw err;
		    myCylinder = new engine.cylinder({
			intake: {
			    endpoint: "ipc://spec.ipc",
			    callback: callback
			},
			compression: {
			    endpoint: "ipc://piston.ipc"
			}
		    });

		    codePush.send("foo");
		});
	
	    });
	    	    
	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback.callCount).toBe(1);
		codePush.close();
		pistonSocket.close();
		myCylinder.close();
	    });
	});
    });
    
    describe("compression socket",function(){
	it("sends zeromq requests to an endpoint", function(){
	    var myCylinder;
	    var callback = jasmine.createSpy();
	    var context = require('zeromq');
	    var mockPiston = context.createSocket("rep");
	    mockPiston.bind("ipc://spec.ipc", function(err){
		if (err) throw err;
		myCylinder = new engine.cylinder({
		    compression:{
			endpoint: "ipc://spec.ipc"
		    }
		});

		myCylinder.ignite("foo");
	    });

	    mockPiston.on("message", callback);

	    waitsFor(function(){
		return callback.callCount > 0;
	    });
	    
	    runs(function(){
		expect(callback.mostRecentCall.args[0].toString()).toEqual("foo");
		myCylinder.close();
		mockPiston.close();
	    });
	});

	it("receives zeromq responses from an endpoint", function(){
	    var myCylinder;
	    var callback = jasmine.createSpy();
	    var context = require('zeromq');
	    var mockPiston = context.createSocket("rep");
	    mockPiston.bind("ipc://spec.ipc", function(err){
		if (err) throw err;
		myCylinder = new engine.cylinder({
		    compression:{
			endpoint: "ipc://spec.ipc",
			callback: callback
		    }
		});

		myCylinder.ignite("foo");
	    });

	    // Catch the request and send it back
	    mockPiston.on("message", function(data){
		mockPiston.send(data);
	    });

	    waitsFor(function(){
		return callback.callCount > 0;
	    });
	    
	    runs(function(){
		expect(callback.mostRecentCall.args[0].toString()).toEqual("foo");
		myCylinder.close();
		mockPiston.close();
	    });
	});
    });

    describe("exhaust socket",function(){
	it("receives zeromq responses", function(){
	    pending();
	});
    });

});