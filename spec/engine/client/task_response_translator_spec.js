var TaskResponseTranslator = require("../../../lib/engine/client/task/task_response_translator").TaskResponseTranslator,
    TaskResponse = require("../../../lib/engine/client/task/response.js").TaskResponse;

describe("TaskResponseTranslator", function(){
    beforeEach(function(){
        this.translator = TaskResponseTranslator.make();
    });

    describe("translating a raw response string", function(){
        beforeEach(function(){
            this.response = this.translator.translate('task-123 {"task_id":"task-123", "response": {"evaluation":"hello world", "globals":{"hello":"world"}}}');
        });

        it("returns a TaskResponse object", function(){
            expect(this.response instanceof TaskResponse).toBeTruthy();
        });

        it("captures the task ID", function(){
            expect(this.response.getTaskId()).toBe("task-123");
        });

        it("captures the task's last evaluated response", function(){
            expect(this.response.getEvaluation()).toBe("hello world");
        });

        it("captures whether or not the task's code threw an error", function(){
            expect(this.response.isError()).toBeFalsy();

            var response = 'task-123 {"task_id":"task-123", "response":{"evaluation":"hello world", "error": true}}';
            expect(this.translator.translate(response).isError()).toBeTruthy();
        });

        it("captures whether or not the task's execution threw an error", function(){
            expect(this.response.isExecutionError()).toBeFalsy();
            var response = 'task-123 {"task_id":"task-123", "error":true, "response":{"evaluation":"hello world", "error": true}}';
            expect(this.translator.translate(response).isExecutionError()).toBeTruthy();
        });

        it("captures the task context's global variables", function(){
            expect(this.response.getGlobals()).toEqual({hello:"world"});
        });

        it("captures console output", function(){
            var response = this.translator.translate('task-123 {"task_id":"task_123", "console":"foo bar baz"}');
            expect(response.getOutput()).toBe("foo bar baz");
        });

        it("sets whether or not the response has console output", function(){
            
            expect(this.response.hasOutput()).toBeFalsy();

            var response = this.translator.translate('task-123 {"task_id":"task_123", "console":"foo bar baz"}');
            expect(response.hasOutput()).toBeTruthy();
        });
    });
});