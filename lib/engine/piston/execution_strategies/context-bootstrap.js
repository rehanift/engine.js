"use strict";

//Function.prototype.constructor = function(){ throw new SecurityError("The Function constructor may not be called"); };
Function.prototype.toString = function(){ throw new SecurityError("'toString' may not be called on functions"); };

var SecurityError = function(message){
    this.message = message;
    this.name = "SecurityError";
};
SecurityError.prototype = Error.prototype;