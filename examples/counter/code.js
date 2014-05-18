var tweets = "foo";

save_for_later("baz");

function with_callback(cb){
    cb();
}

search_twitter("nodejs", function(results){
    save_for_later(results[0]);
    console.log(get_saved());
});

with_callback(function(){
    save_for_later("qux");
});

async_do(function(){
    save_for_later("qul");
});