var engine = require("../../../engine").engine;

describe("node_vm", function(){
    describe("#execute", function(){
        var strategy = engine.piston.execution_strategies.node_vm.make();
        var sandbox = {
            add: function(a,b){ return a+b;}
        };

        it("evalutes code against a sandbox", function(){
            var last_eval = strategy.execute("add(1,1)", sandbox);            
            expect(last_eval).toBe(2);
        });

        it("throws a SyntaxError when the user-code has bad syntax", function(){
            var last_eval = strategy.execute("add(1,1", sandbox);            
            expect(last_eval).toContain("SyntaxError");
        });

        it("throws a ReferenceError when the user-code calls an unknown sandbox function", function(){
            var last_eval = strategy.execute("subtract(1,1)", sandbox);
            expect(last_eval).toContain("ReferenceError");
        });
    });
});