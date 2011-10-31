var engine = require("engine.js").engine;
var client, task, intake, exhaust, cylinder, logging_gateway, stdout_client, logging_opts;

logging_gateway = engine.logging_gateway.create();
stdout_client = engine.logging_stdout_client.create();
logging_gateway.add_logger(stdout_client);

logging_opts = {
    logging_gateway: logging_gateway
};

intake = engine.intake.create(logging_opts);
exhaust = engine.exhaust.create(logging_opts);
cylinder = engine.cylinder.create(logging_opts);
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