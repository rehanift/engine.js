var engine = require("./engine").engine;

var c1 = new engine.cylinder();
//var c2 = new engine.cylinder();

var FETCH = '(function(locals){'+
'    return {'+
'	fetch: function(resource, options, callback){'+
'	    var url = require("url");'+
'	    var http = require("http");'+
''+
'	    var parsed_url = url.parse(resource);'+
'	    var http_options = {'+
'		host: parsed_url.hostname,'+
'		port: parsed_url.port || 80,'+
'		path: parsed_url.pathname + (parsed_url.search || "") + (parsed_url.hash || ""),'+
'		method: options.method || "GET"'+
'	    };'+
''+
'	    var req = http.request(http_options, function(res){'+
'		var body = "";'+
'		res.on("data", function(chunk){'+
'		    body += chunk;'+
'		});'+
'		res.on("end", function(){'+
'		    callback(body);'+
'		});'+
'	    });'+
'	    req.end();	    '+
'	}'+
'    };'+
'});';

var client = new engine.client({
    cylinder_block:"ipc://code.ipc",
    crankshaft:"ipc://results.ipc"
});
client.on("ready", function(){
    console.log("client is ready");
    var task = client.createTask();
    task.setContext(FETCH);
    task.setLocals({});

    var CODE = 'fetch("http://www.google.com",{},function(data){ console.log(data); });';

    task.setCode(CODE);
    task.setCallback(function(data){ 
	console.log(data.toString());
	//client.close();
	//c1.close();
	//c2.close();
    });
    
    task.run();
});