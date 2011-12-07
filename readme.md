Engine.js
=========
The scriptable task engine

What is Engine.js?
------------------

Engine.js is a framework for extending web applications to allow users
to write their own server-side javascript code to interact with the
application. Engine.js lets users create their own functionality
within the application.

When you integrate Engine.js with your web application you must
explicitly determine what set of functions users can call from their
custom scripts. Implicitly, all Javascript
[built-in objects](http://es5.github.com/#x4.2) are available (though
you can explicitly re-define their definitions if you choose to).

Engine.js currently uses Node.js for script evaluation. It has a
client library for Node.js (bundled). Ruby and PHP client libraries
are planned.

See the
[Overview](https://github.com/rehanift/engine.js/wiki/Overview) and
[Documentation](https://github.com/rehanift/engine.js/wiki/Documentation)
pages for more information.

### Dependencies
   - Linux or OS X
   - Node.js (v0.4 ONLY)
   - NPM
   - ZeroMQ (2.1)
     - OS X: `brew install zeromq`
     - Linux: [See 0mq INSTALL](https://raw.github.com/zeromq/zeromq2-1/master/INSTALL)

### Quick Start
  - Install the library: `npm install engine.js`
  
  - Start the server: `node script/server.js`

  - Write your code    

	```javascript
    var engine = require("engine.js").engine;
	client = engine.client.create();
	    
	task = client.createTask();
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

You must have both `Express` and `Socket.io` installed

	npm install express
	npm install socket.io
	
You can then run: `node examples/dashboard/app.js` and open your browser to `http://localhost:3000`

### Future Plans
  - Support for other sandboxable scripting languages (ie. Lua)
  - Support other Javascript runtimes (ie. RingoJS)
  - Client's in other languages (Java, Python, etc. Basically any language that has [ZeroMQ bindings](http://www.zeromq.org/bindings:_start))
  - Benchmarks
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
