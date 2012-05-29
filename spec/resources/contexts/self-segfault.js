(function(locals){
  var kill_yourself = function(){
    process.kill(process.pid, "SIGSEGV");
  };

  return {
    kill_yourself: kill_yourself
  };
});