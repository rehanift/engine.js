var provide_defaults = require("../../../lib/engine/helpers/provide_defaults");

describe("provide_defaults", function(){
    var original, defaults, with_defaults;

    it("provides a default value for an original key when the original key's value is missing", function(){
	original = {};
	defaults = {foo : "bar"};
	with_defaults = provide_defaults(original, defaults);

	expect(with_defaults["foo"]).toBe("bar");
    });

    it("does not provide a default value for an original key when the original key's value exists", function(){
	original = {foo : "baz"};
	defaults = {foo : "bar"};
	with_defaults = provide_defaults(original, defaults);

	expect(with_defaults["foo"]).toBe("baz");
    });

    it("provides a default value when the original object is absent", function(){
	defaults = {foo : "bar"};
	with_defaults = provide_defaults(null, defaults);

	expect(with_defaults["foo"]).toBe("bar");
    });    
});
