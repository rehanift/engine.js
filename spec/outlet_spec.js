var Outlet = require('../lib/Outlet.js').Outlet;

var Model = function(){};
Outlet.call(Model.prototype);

describe("With Outlet mixed-in", function(){
    it("an object will throw an error if socket support has not been included",function(){
	var myModel = new Model();
	var mySocket = new Object();
	
	expect(function(){
	    myModel.addSocket("dumb socket",mySocket);
	}).toThrow("Socket support has not been included for this object. Please use #includeSocketSupport");
    });
    
    describe("#getSockets", function(){
	it("returns an objects sockets", function(){	    
	    var myModel = new Model();
	    var mySocket = new Object();
	    
	    myModel.includeSocketSupport();
	    myModel.addSocket("my socket", mySocket);
	    
	    var sockets = myModel.getSockets();
	    expect(sockets[0]).toBe(mySocket);
	});
    });

    describe("#getSocket", function(){
	it("returns an object's socket by name", function(){	    
	    var myModel = new Model();
	    var mySocket = new Object();
	    
	    myModel.includeSocketSupport();
	    myModel.addSocket("my socket", mySocket);
	    
	    var socket = myModel.getSocket("my socket");
	    expect(socket).toBe(mySocket);
	});
    });

    describe("#addSocket", function(){
	it("adds a socket by name to an Outlet", function(){
	    var myModel = new Model();
	    var mySocket = new Object();

	    myModel.includeSocketSupport();
	    myModel.addSocket("dumb socket",mySocket);

	    var socket = myModel.getSocket("dumb socket");
	    expect(socket).toBe(mySocket);
	});

	it("throws an error when trying to add a socket by name that already exists", function(){
	    var myModel = new Model();
	    var mySocket = new Object();

	    myModel.includeSocketSupport();
	    myModel.addSocket("dumb socket",mySocket);
	    
	    try {
		myModel.addSocket("dumb socket",mySocket);
	    } catch (e) {
		expect(e).toMatch("A Socket with this name already exists");
	    }
	});
    });    
});