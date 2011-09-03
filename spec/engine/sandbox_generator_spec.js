var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("sandboxGenerator", function(){
    describe("#generate",function(){
        it("returns a sandbox from a given context", function(){
            var sg = engine.piston.sandboxGenerator.make();
            var console_socket = new mock.socket();
            var sandbox = sg.generate(console_socket,
                                      "(function(locals){ return {foo:function(){}} });",
                                      {});

            expect(typeof sandbox.foo).toBe("function");
        });

        it("returns a sandbox from a given context with bound local variables", function(){
            var console_socket = new mock.socket();
            var sg = engine.piston.sandboxGenerator.make();
            var sandbox = sg.generate(console_socket,
                                      "(function(locals){ return {foo:function(){ return locals.hello }} });",
                                      {hello:"world"});
            
            expect(sandbox.foo()).toBe("world");
        });
    });

    describe("console",function(){
        it("logs messages to the console_socket", function(){
            var console_socket = new mock.socket();
            spyOn(console_socket,'send');

            var sg = engine.piston.sandboxGenerator.make();
            var sandbox = sg.generate(console_socket,
                                      "(function(locals){ return {foo:function(bar){ console.log(bar); }} });",
                                      "");
            sandbox.foo("bar");

            expect(console_socket.send).toHaveBeenCalled();
        });       
    });
});