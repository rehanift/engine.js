var TaskResponseSerializer = require("../../../lib/engine/cylinder/task_response_serializer");
var TaskResponse = require("../../../lib/engine/client/task/response").TaskResponse;

describe("TaskResponseSerializer", function(){
  beforeEach(function(){
    this.serializer = TaskResponseSerializer.create();
    this.addMatchers({
      toBeJsonString: function(){
        try {
          JSON.parse(this.actual);
          return true;
        } catch (e) {
          return false;
        }
      }
    });
  });

  it("serializes a TaskResponse", function(){
    var response = new TaskResponse({
      response:{
        task_id: "123",
        evaluation: "foo",
        error: "bar"
      }
    });

    var serialized_response = this.serializer.serialize(response);
    expect(serialized_response).toBeJsonString();
    expect(serialized_response).toContain("123");
    expect(serialized_response).toContain("foo");
    expect(serialized_response).toContain("bar");
  });
});