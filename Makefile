all: test

test: unit-test end-to-end-test

unit-test:
	jessie spec/engine/

end-to-end-test:
	jessie spec/end-to-end/basic_spec.js
	jessie spec/end-to-end/errors_spec.js
clean:
	rm *.ipc
