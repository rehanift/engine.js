process.stdin.resume();

setInterval(function(){
  var data = {
    uid: process.getuid(),
    gid: process.getgid()
  };

  console.error(JSON.stringify(data));
}, 100);