var engine = require("../../engine").engine;
var mock = require("../spec_helper").mock;

describe("sandboxGenerator", function(){
    describe("#generate",function(){
        it("returns a sandbox from a given context", function(){
            var console_socket = new mock.socket();
            var sg = engine.piston.sandboxGenerator.make({
                console_socket: console_socket,
                context: "(function(locals){ return {foo:function(){}} });",
                locals: ""
            });
            var sandbox = sg.generate();

            expect(typeof sandbox.foo).toBe("function");
        });

        it("returns a sandbox from a given context with bound local variables", function(){
            var console_socket = new mock.socket();
            var sg = engine.piston.sandboxGenerator.make({
                console_socket: console_socket,
                context: "(function(locals){ return {foo:function(){ return locals.hello }} });",
                locals: {hello:"world"}
            });
            var sandbox = sg.generate();
            
            expect(sandbox.foo()).toBe("world");
        });
    });

    describe("console",function(){
        it("logs messages to the console_socket", function(){
            var console_socket = new mock.socket();
            spyOn(console_socket,'send');

            var sg = engine.piston.sandboxGenerator.make({
                console_socket: console_socket,
                context: "(function(locals){ return {foo:function(bar){ console.log(bar); }} });",
                locals: ""
            });
            var sandbox = sg.generate();
            sandbox.foo("bar");

            expect(console_socket.send).toHaveBeenCalled();
        });       
    });
});