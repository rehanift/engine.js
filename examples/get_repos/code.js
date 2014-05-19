var repos = [];
get_repos_for("rehanift", function(results_json){
  results_json.forEach(function(repo){
    repos.push(repo.name);
  });
});