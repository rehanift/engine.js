var jobs = [];

fetch("http://sfbay.craigslist.org/sof/", function($){
  $("blockquote p").each(function(index, item){
        
    if ($(item).attr("align") == "center") {
      return false;
    }
    
    var title = $(item).find("a").first().text();
    var link = $(item).find("a").first().attr("href");
    var location = $(item).find("font").text();

    var job = {
      title: title,
      link: link,
      location: location
    };
      
    jobs.push(job);
    
  });

});