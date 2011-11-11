var sandbox_generator = require("../../../lib/engine/piston/sandbox_generator").sandbox_generator;
var mock = require("../../spec_helper").mock;

describe("sandbox_generator", function(){
    describe("#generate",function(){
        it("returns a sandbox from a given context", function(){
            var sg = sandbox_generator.make();
            var console_socket = new mock.socket();
            var sandbox = sg.generate(console_socket,
                                      "(function(locals){ return {foo:function(){}} });",
                                      {});

            expect(typeof sandbox.foo).toBe("function");
        });

        it("returns a sandbox from a given context with bound local variables", function(){
            var console_socket = new mock.socket();
            var sg = sandbox_generator.make();
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

            var sg = sandbox_generator.make();
            var sandbox = sg.generate(console_socket,
                                      "(function(locals){ return {foo:function(bar){ console.log(bar); }} });",
                                      "");
            sandbox.foo("bar");

            expect(console_socket.send).toHaveBeenCalled();
        });       
    });
});