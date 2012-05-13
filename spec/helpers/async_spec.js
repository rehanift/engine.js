var async = require("../../lib/async");

describe("Async Callback Register", function(){
    beforeEach(function(){
        this.async = async.create();
    });

    it("emits a 'done' event when all callbacks have finished", function(){
        var callback = jasmine.createSpy();
        this.async.on('done', callback);
        this.async.start();
        this.async.start();
        this.async.end();
        this.async.end();
        expect(callback).toHaveBeenCalled();
    });

    it("emits a 'done' event when there are no callbacks", function(){        
        var callback = jasmine.createSpy();
        this.async.on("done", callback);
        this.async.end();
        expect(callback).toHaveBeenCalled();
    });
});