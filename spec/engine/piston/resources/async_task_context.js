(function(){
  return {
    my_async_function: function(cb){
      async.start();
      process.nextTick(function(){
        cb();
        async.end();
      });
    }
  };
})