var TaskRequest = require("./task_request");

var JsonTaskRequestTranslator = function(){};

JsonTaskRequestTranslator.make = function(){
  var translator = new JsonTaskRequestTranslator();
  return translator;
};

JsonTaskRequestTranslator.create = function(){
  var translator = JsonTaskRequestTranslator.make({});
  return translator;
};

JsonTaskRequestTranslator.prototype.translate = function(raw_task_request){
  var json_task_request = JSON.parse(raw_task_request);
  var task_request = new TaskRequest(json_task_request);
  return task_request;
};

module.exports = JsonTaskRequestTranslator;