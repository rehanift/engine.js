var Outlet = function(){
    var self = this;

    self.includeSocketSupport = function() {
	self.sockets = {};
    };

    self.getSockets = function(){
	self.assertSocketSupport();
	var sockets = [];

	for (var i in self.sockets) {
	    sockets.push(self.sockets[i]);
	}
	
	return sockets;
    };

    self.getSocket = function(name){
	self.assertSocketSupport();
	return self.sockets[name];
    };


    self.addSocket = function(name, socket){
	self.assertSocketSupport();
	if (self.sockets[name]) {
	    throw "A Socket with this name already exists";
	} else {
	    self.sockets[name] = socket;	
	}
    };

    self.hasSocketSupport = function(){
	return typeof self.sockets != "undefined";
    };

    self.assertSocketSupport = function(){
	if (!self.hasSocketSupport()) {
	    throw "Socket support has not been included for this object. Please use #includeSocketSupport";
	}
    };

    return self;
};

//Outlet.prototype.getSockets = function(){
//    var self = this;
//    var sockets = [];
//
//    for (var i in self.sockets) {
//	sockets.push(self.sockets[i]);
//    }
//    
//    return sockets;
//};
//
//Outlet.prototype.getSocket = function(name){
//    var self = this;
//    return self.sockets[name];
//};
//
//Outlet.prototype.addSocket = function(name, socket){
//    var self = this;
//    if (self.sockets[name]) {
//	throw "A Socket with this name already exists";
//    } else {
//	self.sockets[name] = socket;	
//    }
//};

exports.Outlet = Outlet;