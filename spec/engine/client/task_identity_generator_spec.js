var task_identity_generator = require("../../../lib/engine/client/task_identity_generator").task_identity_generator;

describe("Task Identity Generator", function(){
    beforeEach(function(){
	this.generator = task_identity_generator.make();
    });

    it("generates unique identities",function(){
	var id1 = this.generator.generate();
	var id2 = this.generator.generate();	
	
	expect(id1).not.toEqual(id2);
    });
});