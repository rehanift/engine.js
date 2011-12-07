var engine = require("../../../../engine").engine;

describe("Logging", function(){
    var logging_gateway,
	stdout_client,
	console_spy;
    
    beforeEach(function(){
	logging_gateway = engine.logging_gateway.create();
	stdout_client = engine.logging_stdout_client.create();
	logging_gateway.add_logger(stdout_client);

	console_spy = spyOn(console,'log');
	//console_spy = spyOn(console,'log').andCallThrough();
    });

    describe("Standard Out Client", function(){	
	it("formats as expected with all parameters", function(){
	    var message = engine.log_message.create({
		task_id: "123",
		component:"Client",
		action:"sent task to Intake",
		data:{
		    foo:"bar"
		}
	    });
	    logging_gateway.log_message(message);
	    expect(console_spy.mostRecentCall.args[0]).toContain("123");
	    expect(console_spy.mostRecentCall.args[0]).toContain("Client");
	    expect(console_spy.mostRecentCall.args[0]).toContain("sent task to Intake");
	});

	it("formats as expected with only required parameters", function(){
	    var message = engine.log_message.create({
		component:"Client",
		action:"has no task or data information"
	    });
	    logging_gateway.log_message(message);
	    expect(console_spy.mostRecentCall.args[0]).toContain("Client");
	    expect(console_spy.mostRecentCall.args[0]).toContain("has no task or data information");
	});
	
    });
});