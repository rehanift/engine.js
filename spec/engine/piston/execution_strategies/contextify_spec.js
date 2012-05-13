var contextify_vm = require("../../../../lib/engine/piston/execution_strategies/contextify_vm").contextify_vm;

describe("Code Runners", function(){
  describe("Contextify", function(){
    beforeEach(function(){
      this.strategy = contextify_vm.make();
      this.sandbox = {
        add: function(a,b){ return a+b;}
      };
    });

    it("evalutes code against a sandbox", function(){
      var response = this.strategy.execute("add(1,1)", this.sandbox);            
      expect(response.evaluation).toBe(2);
    });

    it("throws a SyntaxError when the user-code has bad syntax", function(){
      var response = this.strategy.execute("add(1,1", this.sandbox);            
      expect(response.evaluation).toContain("SyntaxError");
    });

    it("throws a ReferenceError when the user-code calls an unknown sandbox function", function(){
      var response = this.strategy.execute("subtract(1,1)", this.sandbox);
      expect(response.evaluation).toContain("ReferenceError");
    });
  });

});