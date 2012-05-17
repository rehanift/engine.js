var async = require("../../lib/async");

describe("Async Callback Register", function(){
  beforeEach(function(){
    this.async = async.create();
  });

  it("emits a 'done' event when all callbacks have finished", function(){
    var callback = jasmine.createSpy();
    this.async.on('done', callback);
    this.async.start(); // called in function body before callback
    this.async.start(); // called in function body before callback
    this.async.end(); // called immediately after synchronous evaluation
    this.async.end(); // called in function body after callback has been called
    this.async.end(); // called in function body after callback has been called
    expect(callback).toHaveBeenCalled();
  });

  it("emits a 'done' event when there are no callbacks", function(){        
    var callback = jasmine.createSpy();
    this.async.on("done", callback);
    this.async.end();
    expect(callback).toHaveBeenCalled();
  });

  it("does not emit a 'done' event when while a callback is in-progress", function(){
    var callback = jasmine.createSpy();
    this.async.on("done", callback);
    this.async.start(); // called in function body before callback
    this.async.end(); // called immediately after synchronous evaluation

    // the callback has not finished yet
    expect(callback).not.toHaveBeenCalled();
  });
});