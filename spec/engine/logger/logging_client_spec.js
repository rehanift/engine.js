var engine = require("../../../engine").engine;
var mock = require("../../spec_helper").mock;

describe("Logging Client", function(){
    var logging_client;
    var mock_log_formatter;
    var mock_log_writer;

    beforeEach(function(){
	mock_log_formatter = new mock.log_formatter();
	mock_log_writer = new mock.log_writer();

	logging_client = engine.logging_client.make({
	    formatter: mock_log_formatter,
	    writer: mock_log_writer
	});
    });

    it("calls the formatter's format method", function(){
	var mock_log_message = new mock.log_message();
	spyOn(mock_log_formatter,'format');
	
	logging_client.log(mock_log_message);
	
	expect(mock_log_formatter.format).toHaveBeenCalled();
    });

    it("calls the writer's write method", function(){
	spyOn(mock_log_writer,'write');
	var mock_log_message = new mock.log_message();

	logging_client.log(mock_log_message);

	expect(mock_log_writer.write).toHaveBeenCalled();
    });
    
});