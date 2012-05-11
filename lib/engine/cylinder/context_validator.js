var context_validator = function(){};

context_validator.make = function(){
    return new context_validator();
};

context_validator.create = function(){
    return context_validator.make();
};

context_validator.prototype.validate = function(context, locals){
    var evaled_context;
    try {
	evaled_context = eval(context);
    } catch (e) {
	return false;
    }
    
    if (typeof(evaled_context) != "function") {
    	return false;
    }

    var returned_sandbox;
    try {
        returned_sandbox = evaled_context.call(null, locals);
    } catch (e) {
        return false;
    }

    if(Object.prototype.toString.call(returned_sandbox) !== '[object Object]') {
	return false;
    }

    return true;
};

exports.context_validator = context_validator;