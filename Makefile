SHELL := /bin/bash
BUILD_ID := build-$(shell date +'%s')
BUILD_BASEDIR=../engine.js-builds
BUILD_DIR = $(BUILD_BASEDIR)/$(BUILD_ID)
MKDIR = mkdir -p
NODE_VERSION ?= v0.6.11
GOTO_BUILD_DIR = cd $(BUILD_DIR); source ~/.nvm/nvm.sh; nvm use $(NODE_VERSION); 
GOTO_MODULE_DIR = cd node_modules/engine.js;
RUN_LOCAL_SPEC = `npm bin`/jasmine-node

all: test

test: unit-test end-to-end-test

build: deploy verify-deploy run-perf

perf: deploy run-perf

unit-test:
	$(RUN_LOCAL_SPEC) spec/engine/

end-to-end-test: 
	$(RUN_LOCAL_SPEC) spec/end-to-end/

verify-deploy:
	$(GOTO_BUILD_DIR) $(GOTO_MODULE_DIR) $(RUN_LOCAL_SPEC) spec/engine
	$(GOTO_BUILD_DIR) $(GOTO_MODULE_DIR) $(RUN_LOCAL_SPEC) spec/end-to-end

deploy:
	$(MKDIR) $(BUILD_DIR)
	$(MKDIR) $(BUILD_DIR)/node_modules
	$(GOTO_BUILD_DIR) npm install --dev ../../engine.js

clean:
	rm -rf $(BUILD_BASEDIR)
	rm -f *.ipc

run-perf: 
	$(GOTO_BUILD_DIR) $(GOTO_MODULE_DIR) $(RUN_LOCAL_SPEC) spec/load

