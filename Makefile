SHELL := /bin/bash
BUILD_ID := build-$(shell date +'%s')
BUILD_BASEDIR=../engine.js-builds
BUILD_DIR = $(BUILD_BASEDIR)/$(BUILD_ID)
MKDIR = mkdir -p
NODE_VERSION ?= v0.4.12
GOTO_BUILD_DIR = cd $(BUILD_DIR); source ~/.nvm/nvm.sh; nvm use $(NODE_VERSION); 
all: test

test: unit-test end-to-end-test

build: deploy verify-deploy

deps:
	npm install node-uuid
	npm install zmq

unit-test:
	jasmine-node spec/engine/

end-to-end-test: 
	jasmine-node spec/end-to-end/basic_spec.js
	jasmine-node spec/end-to-end/errors_spec.js
	jasmine-node spec/end-to-end/configuration_spec.js

verify-deploy:
	$(GOTO_BUILD_DIR) jasmine-node node_modules/engine.js/spec/engine/
	$(GOTO_BUILD_DIR) cd node_modules/engine.js/; jasmine-node spec/end-to-end/basic_spec.js
	$(GOTO_BUILD_DIR) cd node_modules/engine.js/; jasmine-node spec/end-to-end/errors_spec.js
	$(GOTO_BUILD_DIR) cd node_modules/engine.js/; jasmine-node spec/end-to-end/configuration_spec.js

deploy:
	$(MKDIR) $(BUILD_DIR)
	$(GOTO_BUILD_DIR) npm install --dev ../../engine.js

clean:
	rm -rf $(BUILD_BASEDIR)
	rm -f *.ipc
