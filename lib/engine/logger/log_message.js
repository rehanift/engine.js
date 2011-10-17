var log_message = function(task_id, component, action, data, datetime){
    this.task_id = task_id;
    this.component = component;
    this.action = action;
    this.data = data;
    this.datetime = datetime;
};

log_message.prototype.get = function(property){
    return this[property];
};

log_message.prototype.has = function(property){
    return typeof this[property] != "undefined";
};

log_message.make = function(config){
    return new log_message(config.task_id,
			   config.component,
			   config.action,
			   config.data,
			   config.datetime);
};

log_message.create = function(options){
    return log_message.make({
	task_id: options.task_id,
	component: options.component,
	action: options.action,
	data: options.data,
	datetime: new Date()
    });
};

exports.log_message = log_message;