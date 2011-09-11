var engine = require("./engine").engine;
var client, task, intake, exhaust, cylinder;

intake = engine.intake.create();
exhaust = engine.exhaust.create();
cylinder = engine.cylinder.create();
client = engine.client.create();

var express = require("express");
var app = express.createServer();
var io = require("socket.io").listen(app);

app.configure(function(){
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

io.sockets.on('connection', function(socket){
  socket.on('run', function(data){
    console.log(data);
    task = client.createTask();
    task.setContext(data.context);
    task.setLocals({});
    task.setCode(data.code);        
    task.on('eval', function(data){
      socket.emit('eval', data);
    });

    task.on('output', function(data){
      socket.emit('console', data);
    });

    task.run();
  });
});

app.listen(3000);