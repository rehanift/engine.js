describe("Task", function(){
    it("has a unique ID", function(){ pending(); });

    describe("#setContext", function(){
        it("sets the context for a task", function(){ pending(); });
        it("fails when an invalid context is passed", function(){ pending(); });
    });

    describe("#setLocals", function(){
        it("sets the local variables for a task", function(){ pending(); });
        it("fails when invalid local variables are passed", function(){ pending(); });
    });

    describe("#setUserCode", function(){
        it("sets the user-code for a task", function(){ pending(); });
        it("fails when invalid user-code is passed", function(){ pending(); });
    });

    // This is stored on the client instance. Does it belong here?
    describe("#setCallback", function(){
        it("stores a callback", function(){ pending(); });
    });
    
    describe("#run", function(){
        it("sends the task to its client's cylinder block", function(){ pending(); });
        it("stores a callback to itself if passed at runtime", function(){ pending(); });
    });

    it("emits a 'complete' event when results are received from the client's crankshaft", function(){ pending(); });
    it("calls its callback when results are received from the client's crankshaft", function(){ pending(); });

});