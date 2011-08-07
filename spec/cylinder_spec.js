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
	pending();
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

    describe("intake socket", function(){
	it("accepts messages from a zeromq pull socket", function(){
	    var context = require("zeromq");
	    var codePush = context.createSocket("push");
	    var callback = jasmine.createSpy();

	    var myCylinder;

	    codePush.bind("ipc://spec.ipc", function(err){
		if(err) throw err;
		myCylinder = new engine.cylinder({
		    intake: {
			endpoint: "ipc://spec.ipc",
			callback: callback
		    }
		});

		codePush.send("foo");
	    });

	    waitsFor(function(){
		return callback.callCount > 0;
	    });

	    runs(function(){
		expect(callback.callCount).toBe(1);
		myCylinder.close();
		codePush.close();
	    });
	});
    });
    
    describe("compress socket",function(){
	it("sends zeromq requests to an endpoint", function(){
	    pending();
	});
    });

    describe("exhaust socket",function(){
	it("receives zeromq responses", function(){
	    pending();
	});
    });

});