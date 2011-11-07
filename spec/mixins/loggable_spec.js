var loggable = require("../../lib/mixins/loggable").loggable,
    mock = require("../spec_helper").mock,
    logging_gateway = require("../../lib/engine/logger/logging_gateway").logging_gateway;

describe("Loggable Mixin", function(){
    var my_class, my_object;

    beforeEach(function(){
	my_class = function(){};
	loggable.call(my_class);
	my_object = new my_class();
    });

    it("should use the passed-in logging_gateway if passed as an option", function(){
	var options = {
	    logging_gateway: new mock.logging_gateway()
	};
	expect(my_class.find_or_create_logging_gateway(options)).toBe(options.logging_gateway);
    });

    it("should create a new logging_gateway when no options are passed", function(){
	spyOn(logging_gateway,'create').andCallThrough();
	expect(my_class.find_or_create_logging_gateway()).toBeTruthy();
	expect(logging_gateway.create).toHaveBeenCalled();
    });

    it("should create a new logging_gateway when options are passed but without a logging_gateway", function(){
	spyOn(logging_gateway,'create').andCallThrough();
	expect(my_class.find_or_create_logging_gateway({})).toBeTruthy();
	expect(logging_gateway.create).toHaveBeenCalled();
    });
});