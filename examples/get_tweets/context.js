(function(locals){

  return {
    get_tweets_for: function(handle, cb){
      async.start(); // tell engine.js that this function expects an asynchronous callback
      var http = require("http");
      var results = "";

      var req = http.request({
        host:"api.twitter.com",
        path:"/1/statuses/user_timeline.json?screen_name=" + handle
      }, function(res){
        res.on('data', function(chunk){
          results += chunk;
        });

        res.on('end', function(){                    
          var parsed_results = JSON.parse(results);
          cb(parsed_results);
          async.end(); // tell engine.js that an asynchronous callback has finished
        });
      });

      req.end();
      
    }
  };
});