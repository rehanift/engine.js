var contextify_vm = require("../../../../lib/engine/piston/execution_strategies/contextify_vm").contextify_vm;
var mock = require("../../../spec_helper").mock;

describe("Code Runners", function(){
  describe("Contextify", function(){
    beforeEach(function(){
      this.strategy = contextify_vm.make();
      this.sandbox = {
        add: function(a,b){ return a+b;}
      };
      this.async = new mock.async_callback_register();
    });

    it("evalutes code against a sandbox", function(){
      var callback = jasmine.createSpy();
      this.strategy.on("execution_complete", callback);
      
      this.strategy.execute("add(1,1)", this.sandbox, this.async);
      this.async.emit("done");

      waitsFor(function(){
        return callback.callCount > 0;
      });

      runs(function(){
        expect(callback.mostRecentCall.args[0].evaluation).toBe(2);
      });
    });

    it("throws a SyntaxError when the user-code has bad syntax", function(){
      var callback = jasmine.createSpy();
      this.strategy.on("execution_complete", callback);
      
      this.strategy.execute("add(1,1", this.sandbox, this.async);
      this.async.emit("done");

      waitsFor(function(){
        return callback.callCount > 0;
      });

      runs(function(){
        expect(callback.mostRecentCall.args[0].evaluation).toContain("SyntaxError");
      });
    });

    it("throws a ReferenceError when the user-code calls an unknown sandbox function", function(){
      var callback = jasmine.createSpy();
      this.strategy.on("execution_complete", callback);
      
      this.strategy.execute("subtract(1,1)", this.sandbox, this.async);
      this.async.emit("done");

      waitsFor(function(){
        return callback.callCount > 0;
      });

      runs(function(){
        expect(callback.mostRecentCall.args[0].evaluation).toContain("ReferenceError");
      });
    });
  });

});