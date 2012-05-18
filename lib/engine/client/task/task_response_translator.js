var TaskResponse = require("./response").TaskResponse;

var TaskResponseTranslator = function(){};

TaskResponseTranslator.make = function(){
    var translator = new TaskResponseTranslator();
    return translator;
};

TaskResponseTranslator.create = function(){
    var translator = TaskResponseTranslator.make({});
    return translator;
};

TaskResponseTranslator.prototype.translate = function(raw_response){
    var delimiter_pos = raw_response.indexOf(' '),
        payload = raw_response.substring(delimiter_pos + 1),
        params = JSON.parse(payload);    

    return new TaskResponse(params);
};

module.exports.TaskResponseTranslator = TaskResponseTranslator;