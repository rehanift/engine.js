var logging_client = require("./logging_client").logging_client;

var client = function(){};

client.create = function(){
    return logging_client.make({
	formatter: stdout_formatter.create(),
	writer: stdout_writer.create()
    });
};

exports.stdout_client = client;
//---------- Formatter ----------//

var stdout_formatter = function(){};

// TODO: maybe we should make a logging formatter helper mixin?
stdout_formatter.prototype.format_datetime = function(date){
    var pad = function(num, length){
	var is_negative = num < 0;
	num = Math.abs(num);
	num = (num + 1e15 + "").slice(length*-1);
	num = is_negative ? "-" + num : num;

	return num;
    };

    var day = date.getDate();
    var month_num = date.getMonth();
    var year = date.getFullYear();
    var hour = pad(date.getHours(), 2);
    var minute = pad(date.getMinutes(), 2);
    var second = pad(date.getSeconds(), 2);
    var zone = "GMT"+pad((date.getTimezoneOffset() / 60) * -100, 4);

    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    var timestamp_part = "["+ day + "/" + months[month_num] + "/" + year + ":" + hour + ":" + 
	    minute + ":" + second + " " + zone +"]";

    return timestamp_part;
};

stdout_formatter.prototype.format = function(message){
    var buffer = [];
    buffer.push(this.format_datetime(message.get('datetime')));
    buffer.push(message.get('component'));
    buffer.push('"'+message.get('action')+'"');
    if (message.has('task_id')) {
	buffer.push(message.get('task_id'));
    }
    return buffer.join(" ");
};

stdout_formatter.make = function(){
    return new stdout_formatter();
};

stdout_formatter.create = function(){
    return stdout_formatter.make();
};

exports.stdout_client = client;

//---------- Writer ----------//

var stdout_writer = function(){};

stdout_writer.prototype.write = function(message){
    console.log(message);
};

stdout_writer.make = function(){
    return new stdout_writer();
};

stdout_writer.create = function(){
    return stdout_writer.make();
};