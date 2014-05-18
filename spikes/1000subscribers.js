var zmq = require("zmq");

var arrayUnique = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

var pubSubPort = "tcp://127.0.0.1:55555";

var subCount = 2500;

var subscriptions = [];

for (var s = 0; s < subCount; s++) {
  subscriptions.push("a"+s);
}

console.log("unique subscriptions:"+(arrayUnique(subscriptions)).length);

// create a subscription with all generated filters (ie. 2500)
var subSocket = zmq.socket('sub');
subSocket.connect(pubSubPort);


for (var i = 0; i < subCount; i++) {
  subSocket.subscribe(subscriptions[i]);
}

var done = 0;
subSocket.on("message", function(data){
  done++;
  console.log(done);
  var message = data.toString();
  var filter = message.split(" ")[0];
  subSocket.unsubscribe(filter);
});

var pubSocket = zmq.socket('pub');
pubSocket.bind(pubSubPort, function(err){
  console.log("socket bound");
  
  setTimeout(function(){
    for (var j = 0; j < subCount; j++) {
      pubSocket.send(subscriptions[j]+" hello");
    }
    
    console.log("messages sent");
  }, 5000);  

});