var util = require('util'),
    events = require('events'),
    Outlet = require('../lib/Outlet.js').Outlet;

var engine = require('../robust').engine;

var PISTON_ENDPOINT = "ipc://spec.ipc";
var SIMPLE_PAYLOAD = {
  context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
  locals: "",
  code: "add(1,1)"
};

var BAD_SYNTAX_PAYLOAD = {
  context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
  locals: "",
  code: "add(1,1"
};

var BAD_CONTEXT_PAYLOAD = {
  context: "(function(locals){ return { add: function(a,b) { return a+b } }});",
  locals: "",
  code: "subtract(1,1)"
};

var mockCylinder = function(options){
  var context = require('zeromq');
  var self = this;
  
  self.includeSocketSupport();
  self.addSocket("combustion", context.createSocket("req"));
  
  self.getSocket("combustion").connect(PISTON_ENDPOINT);
  self.getSocket("combustion").on("message", function(data){
    self.emit('exhaust', data.toString());
  });
  
  self.compress = function(config){
    self.getSocket("combustion").send(config);
  };
};
util.inherits(mockCylinder, events.EventEmitter);
Outlet.call(mockCylinder.prototype);

describe("Piston", function(){
  var myCylinder, myPiston;
  
  beforeEach(function(){
    myCylinder = new mockCylinder();
    myPiston = new engine.piston({
      endpoint: PISTON_ENDPOINT
    });    
  });

  afterEach(function(){
    // We need to close all the sockets or the spec won't exit when finished
    myPiston.getSockets().forEach(function(socket){
      socket.close();
    });
    myCylinder.getSockets().forEach(function(socket){
      socket.close();
    });
  });

  it("responds to cylinder requests", function(){
    myCylinder.compress(JSON.stringify(SIMPLE_PAYLOAD));
    
    var callback = jasmine.createSpy();
    myCylinder.on('exhaust', callback);
    
    waitsFor(function(){
      return callback.callCount > 0;
    });
      
    runs(function(){
      expect(callback.callCount).toEqual(1);      
    });
  });
  
  // This is the happy case
  it("evaluates user-code against a given context", function(){    
    myCylinder.compress(JSON.stringify(SIMPLE_PAYLOAD));

    var callback = jasmine.createSpy();
    myCylinder.on('exhaust', callback);
    
    waitsFor(function(){
      return callback.callCount > 0;
    });
    
    runs(function(){
      var parsed_response = JSON.parse(callback.mostRecentCall.args[0]);
      expect(parsed_response['returned_data']).toEqual(2);
    });
  });

  // These are the unhappy-cases
  it("throws a SyntaxError when the user-code has syntatically bad code", function(){
    myCylinder.compress(JSON.stringify(BAD_SYNTAX_PAYLOAD));
    
    var callback = jasmine.createSpy();
    myCylinder.on('exhaust', callback);
    
    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      var parsed_response = JSON.parse(callback.mostRecentCall.args[0]);
      expect(parsed_response['returned_data']).toContain("SyntaxError");
    });
  });

  it("throws a ReferenceError when the user-code calls a function that is not defined in the Context", function(){
    myCylinder.compress(JSON.stringify(BAD_CONTEXT_PAYLOAD));
    
    var callback = jasmine.createSpy();
    myCylinder.on('exhaust', callback);
    
    waitsFor(function(){
      return callback.callCount > 0;
    });

    runs(function(){
      var parsed_response = JSON.parse(callback.mostRecentCall.args[0]);
      expect(parsed_response['returned_data']).toContain("ReferenceError");
    });
  });
});

