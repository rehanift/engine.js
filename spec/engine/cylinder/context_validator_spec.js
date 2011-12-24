var context_validator = require("../../../lib/engine/cylinder/context_validator").context_validator;

describe("Context Validator", function(){
    beforeEach(function(){
	this.validator = context_validator.make();
    });

    it("fails when the context has a syntax error", function(){
	var context_with_syntax_error = "(function(){ {{{{{{ })";
	expect(this.validator.validate(context_with_syntax_error)).toBe(false);
    });

    it("fails when the evaluated result of the context is not a function", function(){	
	var context_that_is_not_a_function = "({'foo':'bar'})";
	expect(this.validator.validate(context_that_is_not_a_function)).toBe(false);
    });

    it("fails when the context function does not return an object literal", function(){
	var context_that_doesnt_return_object_literal = "(function(){ return 1; })";
	expect(this.validator.validate(context_that_doesnt_return_object_literal)).toBe(false);
    });
});