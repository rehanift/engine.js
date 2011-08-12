var Checklist = require("../lib/checklist.js").Checklist;

var Model = function(){};
Checklist.call(Model.prototype);

describe("Checklist", function(){
    it("does not maintain state across objects", function(){
        var Model2 = function(){
            var self = this;
            self.setRequirements(["foo","bar"]);
        };
        Checklist.call(Model2.prototype);

        var first = new Model2();
        var second = new Model2();

        var callback1 = jasmine.createSpy();
        var callback2 = jasmine.createSpy();
        
        first.checkoff("foo", callback1);
        second.checkoff("bar", callback2);

        expect(callback1.mostRecentCall.args[0]).toEqual(["bar"]);
        expect(callback2.mostRecentCall.args[0]).toEqual(["foo"]);

    });

    describe("#setRequirements", function(){        
        it("sets the checklist requirements", function(){
            var requirements = ["foo", "bar"];
            var myModel = new Model();
            
            myModel.setRequirements(requirements);
            
            expect(myModel.requirements).toEqual(requirements);
        });
    });

    describe("#checkoff", function(){
        it("removes a requirement if it exists", function(){ 
            var callback = jasmine.createSpy();
            var requirements = ["foo", "bar"];
            var myModel = new Model();
            
            myModel.setRequirements(requirements);
            myModel.checkoff("foo", callback);
            
            waitsFor(function(){
                return callback.callCount > 0;
            });
            
            runs(function(){
                expect(callback.mostRecentCall.args[0]).toEqual(["bar"]);
            });
        });

        it("does not remove a requirement if it does not exist", function(){ 
            var requirements = ["foo", "bar"];
            var myModel = new Model();
            
            myModel.setRequirements(requirements);
            myModel.checkoff("hello");
                        
            expect(myModel.requirements).toEqual(["foo","bar"]);
        });
    });
});