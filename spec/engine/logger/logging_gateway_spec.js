var engine = require("../../../engine").engine;
var mock = require("../../spec_helper").mock;

describe("Logging Gateway", function(){
    var logging_gateway;
    beforeEach(function(){
	logging_gateway = engine.logging_gateway.make();
    });

    it("can add new logging clients", function(){
	var mock_logger = new mock.logging_client();

	logging_gateway.add_logger(mock_logger);

	expect(logging_gateway.get_loggers()).toContain(mock_logger);
    });

    it("logs messages to all attached logging clients", function(){
	var mock_logger_1 = new mock.logging_client();
	var mock_logger_2 = new mock.logging_client();
	spyOn(mock_logger_1,'log');
	spyOn(mock_logger_2,'log');

	var mock_log_message = new mock.log_message();

	logging_gateway.add_logger(mock_logger_1);
	logging_gateway.add_logger(mock_logger_2);
	logging_gateway.log_message(mock_log_message);

	expect(mock_logger_1.log).toHaveBeenCalledWith(mock_log_message);
	expect(mock_logger_2.log).toHaveBeenCalledWith(mock_log_message);
    });

    it("log({}) is a shorter version of log_message(message)", function(){
	var mock_logger = new mock.logging_client();
	var logger_spy = spyOn(mock_logger,'log');

	logging_gateway.add_logger(mock_logger);

	logging_gateway.log({
	    task_id:"123",
	    component:"test",
	    action:"is being tested"
	});

	expect(mock_logger.log).toHaveBeenCalled();
	expect(logger_spy.mostRecentCall.args[0] instanceof engine.log_message).toBeTruthy();
    });
});