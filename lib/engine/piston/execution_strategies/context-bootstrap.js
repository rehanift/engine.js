"use strict";

//Function.prototype.constructor = function(){ throw new SecurityError("The Function constructor may not be called"); };

var SecurityError = function(message){
    this.message = message;
    this.name = "SecurityError";
};
SecurityError.prototype = Error.prototype;