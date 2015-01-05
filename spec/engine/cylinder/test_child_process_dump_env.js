process.stdin.resume();

setInterval(function(){
  var data = {
    env: process.env
  };

  console.error(JSON.stringify(data));
}, 100);