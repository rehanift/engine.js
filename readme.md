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
   - Node.js (tested with v0.10.0)
   - NPM
   - ZeroMQ (3.2)
     - OS X: `brew install zeromq`
     - Linux: [See 0mq INSTALL](https://raw.githubusercontent.com/zeromq/zeromq3-x/master/INSTALL)
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
      
    task.on('eval', function(err, response){
      if(err){
        console.log("An error was encountered *before* executing your task");
        throw err;
      }

      if(response.isError()) {
        console.log("An error was encountered *while* executing your task");
        throw response.getEvaluation();
      } 
  
      console.log(response.getGlobals()); // The global state of your context after execution
      
      console.log('your code was evaluated as:', response.getEvaluation()); //#=> 3 
      
      client.close();       
    });

    task.run();
	```
      
  - Profit!

### Tests
Engine.js has both unit tests (spec/engine) and end-to-end tests (spec/end-to-end). Both types are written with [Jasmine](https://github.com/pivotal/jasmine/wiki) and run with [jasmine-node](https://github.com/mhevery/jasmine-node).
  
  - **First** clone the repository and then run `npm install .` from the project root.
  - To run the unit test suite, run `make unit-test`
  - To run the integration test suite, run `make end-to-end-test`
  - To run the full test suite, run `make test`

### Benchmarks
Engine.js has a preliminary benchmark script at `spec/load/perf_spec.js`. The script creates ~ 1000 tasks that add two random numbers together. The script cycles through a variety of transport types (TCP or IPC), number of clients, and number of cylinders. I got the following results on an EC2 c3.xlarge:

    [tcp] 1000 tasks from 1 clients against 1 cylinders completed in 16.45 seconds (60 tps)
    [ipc] 1000 tasks from 1 clients against 1 cylinders completed in 15.837 seconds (63 tps)
    [tcp] 1000 tasks from 1 clients against 2 cylinders completed in 10.132 seconds (98 tps)
    [ipc] 1000 tasks from 1 clients against 2 cylinders completed in 9.001 seconds (111 tps)
    [tcp] 1000 tasks from 1 clients against 4 cylinders completed in 6.875 seconds (145 tps)
    [ipc] 1000 tasks from 1 clients against 4 cylinders completed in 6.879 seconds (145 tps)
    [tcp] 1000 tasks from 1 clients against 8 cylinders completed in 6.856 seconds (145 tps)
    [ipc] 1000 tasks from 1 clients against 8 cylinders completed in 6.822 seconds (146 tps)
    [tcp] 1000 tasks from 1 clients against 16 cylinders completed in 7.033 seconds (142 tps)
    [ipc] 1000 tasks from 1 clients against 16 cylinders completed in 7.047 seconds (141 tps)
    [tcp] 961 tasks from 31 clients against 1 cylinders completed in 15.821 seconds (60 tps)
    [ipc] 961 tasks from 31 clients against 1 cylinders completed in 16.166 seconds (59 tps)
    [tcp] 961 tasks from 31 clients against 2 cylinders completed in 9.901 seconds (97 tps)
    [ipc] 961 tasks from 31 clients against 2 cylinders completed in 9.327 seconds (103 tps)
    [tcp] 961 tasks from 31 clients against 4 cylinders completed in 6.606 seconds (145 tps)
    [ipc] 961 tasks from 31 clients against 4 cylinders completed in 6.626 seconds (145 tps)
    [tcp] 961 tasks from 31 clients against 8 cylinders completed in 6.571 seconds (146 tps)
    [ipc] 961 tasks from 31 clients against 8 cylinders completed in 6.61 seconds (145 tps)
    [tcp] 961 tasks from 31 clients against 16 cylinders completed in 6.71 seconds (143 tps)
    [ipc] 961 tasks from 31 clients against 16 cylinders completed in 6.727 seconds (142 tps)

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
