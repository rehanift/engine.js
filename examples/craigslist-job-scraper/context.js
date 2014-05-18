(function(locals){
  return {
    fetch: function(url, cb){
      async.start();
      var request = require("request");
      var cheerio = require("cheerio");

      var doc = request.get(url, function(err, response, body){
        var $ = cheerio.load(body);
        cb($);
        async.end();
      });
    }
  };
});