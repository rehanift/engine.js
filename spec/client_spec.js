describe("Client", function(){
    it("has a unique ID", function(){ pending(); });
    it("receives task results from its configured crankshaft zeromq Pull socket", function(){ pending(); });
    it("sends tasks to its configured cylinder block zeromq Push socket", function(){ pending(); });
    it("calls a task's callback when its results are received", function(){ pending(); });
    it("emits a task's 'complete' event when its results are received", function(){ pending(); });
    
    describe("#createTask", function(){
        it("creates a new Task", function(){ pending(); });
        it("stores a reference to the client within the new task", function(){ pending(); });
    });

    describe("#close", function(){
        it("closes the zeromq sockets", function(){ pending(); });
    });

});