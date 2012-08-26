var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("piston", function(){    
  var piston = engine.piston.make({
    execution_strategy: new mock.execution_strategy(),
    console_socket: new mock.socket(),
    sandbox_generator: new mock.sandbox_generator(),
    server_socket: new mock.socket(),
    result_socket: new mock.socket(),
    watcher_socket: new mock.socket()
  });

  describe("#process_request", function(){
    it("generates a new sandbox", function(){
      spyOn(piston.sandbox_generator,'generate');
      piston.process_request("{}");
      expect(piston.sandbox_generator.generate).toHaveBeenCalled();
    });
    
    it("evaluates code against an execution strategy", function(){
      spyOn(piston.execution_strategy,'execute');
      piston.process_request("{}");
      expect(piston.execution_strategy.execute).toHaveBeenCalled();
    });
  });

  it("#close closes all sockets", function(){
    spyOn(piston.console_socket,'close');
    piston.close();
    expect(piston.console_socket.close).toHaveBeenCalled();
  });
});