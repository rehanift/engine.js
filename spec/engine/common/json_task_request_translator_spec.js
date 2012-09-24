var JsonTaskRequestTranslator = require("../../../lib/engine/common/json_task_request_translator");
var TaskRequest = require("../../../lib/engine/common/task_request");

describe("JsonTaskRequestTranslator", function(){
  beforeEach(function(){
    this.raw_task_request = JSON.stringify({
      task_id: "123",
      context: "foo",
      locals: "bar",
      code: "baz"
    });
    this.translator = JsonTaskRequestTranslator.create();
  });

  it("translates a JSON string into a TaskRequest object", function(){
    var translated_task_request = this.translator.translate(this.raw_task_request);
    expect(translated_task_request instanceof TaskRequest).toBeTruthy();
    expect(translated_task_request.getTaskId()).toBe("123");
    expect(translated_task_request.getContext()).toBe("foo");
    expect(translated_task_request.getLocals()).toBe("bar");
    expect(translated_task_request.getCode()).toBe("baz");    
  });
});