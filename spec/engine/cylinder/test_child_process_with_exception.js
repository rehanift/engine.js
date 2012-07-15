process.stdin.resume();

process.on("uncaughtException", function(err){
  console.error(err);
  process.exit(2);
});

setTimeout(function(){
  someNonexistantFunction();
}, 500);