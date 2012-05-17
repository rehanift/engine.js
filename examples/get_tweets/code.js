var tweets = [];
get_tweets_for("rehanift", function(results_json){
  results_json.forEach(function(tweet){
    tweets.push(tweet.text);
  });
});