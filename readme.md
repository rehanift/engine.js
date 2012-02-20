Engine.js
=========
The scriptable task engine. A framework for executing user server-side javascript in a safe, scalable way.

What is Engine.js?
------------------

Engine.js is a framework for extending web applications to allow users
to write their own server-side javascript code to interact with the
application. Engine.js lets users create their own functionality
within host applications.

When you integrate Engine.js with your web application you must
explicitly determine what set of functions users can call from their
custom scripts. Implicitly, all Javascript
[built-in objects](http://es5.github.com/#x4.2) are available (though
you can explicitly re-define their definitions if you choose to).

Engine.js currently uses Node.js for script evaluation. It has a
client library for Node.js (bundled). Ruby and PHP client libraries
are planned.


For more information:

   - [Getting Started](http://bit.ly/zEdyVb) - A tutorial on how to get first your Engine.js project up and running
   - [Overview](http://bit.ly/yvg2Zs) - An overview of how Engine.js works
   - [Documentation](http://bit.ly/wk4Hoh) - Configuration options

### Dependencies
   - Linux or OS X
   - Node.js (tested with v0.6.7)
   - NPM
   - ZeroMQ (2.1)
     - OS X: `brew install zeromq`
     - Linux: [See 0mq INSTALL](https://raw.github.com/zeromq/zeromq2-1/master/INSTALL)
   - [NVM](https://github.com/creationix/nvm) (Only if you want to run the build script)

### Quick Start
  - Install the library: `npm install engine.js`
  
  - Start the server: `npm run-script engine.js quickstart-server`

  - Write your code    

	```javascript
    var engine = require("engine.js").engine;
    var client = engine.client.create();
        
    var task = client.createTask();
    task.setContext("(function(locals){ return { add: function(a,b){ return a+b } } })");
    task.setLocals({});
    task.setCode('add(1,2)');        
      
    task.on('eval', function(data){
      console.log('your code was evaluated as:', data); //#=> 3   
    });

    task.run();
	```
      
  - Profit!

### Demo
Included in `examples/dashboard` is a demo [Express](http://expressjs.com/) application.

	npm install engine.js
	npm run-script engine.js dashboard

Then open your browser to `http://localhost:3000`

### Tests
Engine.js has both unit tests (spec/engine) and integration tests (spec/end-to-end). Both types are written with [Jasmine](https://github.com/pivotal/jasmine/wiki) and run with [jasmine-node](https://github.com/mhevery/jasmine-node).
  
  - **First** clone the repository and then run `npm install .` from the project root.
  - To run the unit test suite, run `make unit-test`
  - To run the integration test suite, run `make end-to-end-test`
  - To run the full test suite, run `make test`

### Benchmarks
Engine.js has a preliminary benchmark script at `spec/load/perf_spec.js`. The script creates 2500 tasks that add two random numbers together. The script cycles through a variety of transport types (TCP or IPC), number of clients, and number of cylinders. On my personal laptop (Intel Core 2 Duo @ 2.40Ghz w/ 4GB of RAM) I got the following results:

    [tcp] 2500 tasks from 1 clients against 1 cylinders completed in 4.004 seconds (624 tps)
    [ipc] 2500 tasks from 1 clients against 1 cylinders completed in 3.921 seconds (637 tps)
    [tcp] 2500 tasks from 1 clients against 25 cylinders completed in 3.365 seconds (742 tps)
    [ipc] 2500 tasks from 1 clients against 25 cylinders completed in 3.36 seconds (744 tps)
    [tcp] 2500 tasks from 1 clients against 50 cylinders completed in 3.397 seconds (735 tps)
    [ipc] 2500 tasks from 1 clients against 50 cylinders completed in 3.371 seconds (741 tps)
    [tcp] 2500 tasks from 1 clients against 75 cylinders completed in 3.385 seconds (738 tps)
    [ipc] 2500 tasks from 1 clients against 75 cylinders completed in 3.282 seconds (761 tps)
    [tcp] 2500 tasks from 1 clients against 100 cylinders completed in 3.614 seconds (691 tps)
    [ipc] 2500 tasks from 1 clients against 100 cylinders completed in 3.508 seconds (712 tps)
    
    [tcp] 2500 tasks from 50 clients against 1 cylinders completed in 5.515 seconds (453 tps)
    [ipc] 2500 tasks from 50 clients against 1 cylinders completed in 5.094 seconds (490 tps)
    [tcp] 2500 tasks from 50 clients against 25 cylinders completed in 3.53 seconds (708 tps)
    [ipc] 2500 tasks from 50 clients against 25 cylinders completed in 3.677 seconds (679 tps)
    [tcp] 2500 tasks from 50 clients against 50 cylinders completed in 3.403 seconds (734 tps)
    [ipc] 2500 tasks from 50 clients against 50 cylinders completed in 3.467 seconds (721 tps)
    [tcp] 2500 tasks from 50 clients against 75 cylinders completed in 3.941 seconds (634 tps)
    [ipc] 2500 tasks from 50 clients against 75 cylinders completed in 3.855 seconds (648 tps)
    [tcp] 2500 tasks from 50 clients against 100 cylinders completed in 3.605 seconds (693 tps)
    [ipc] 2500 tasks from 50 clients against 100 cylinders completed in 10.578 seconds (236 tps)

> tps = tasks per second


### Future Plans
  - Support for other sandboxable scripting languages (ie. Lua)
  - Support other Javascript runtimes (ie. RingoJS)
  - Client's in other languages (Java, Python, etc. Basically any language that has [ZeroMQ bindings](http://www.zeromq.org/bindings:_start))
  - Demo applications

### License
MIT License

    Copyright (C) 2011 by Rehan Iftikhar
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
