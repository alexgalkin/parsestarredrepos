var fs = require('fs');
var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    //pathPrefix: "/api/v3", // for some GHEs; none for GitHub
    headers: {
        "user-agent": "GitHub-Repo-Analytics" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false, // default: true; there's currently an issue with non-get redirects, so allow ability to disable follow-redirects
    timeout: 5000
});

// TODO: optional authentication here depending on desired endpoints. See below in README.

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

var getDataForPage = function (pageNumber, result) {
  
  github.activity.getStarredReposForUser({
  username: "alexgalkin",
  page: pageNumber,
  per_page: 100
  }, function(err, res) {
    console.log(JSON.stringify(res));

    fs.writeFile("/Users/alexg/projects/nikmobile/githubparser/" + date + "-" + time + pageNumber + ".json", JSON.stringify(res), function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
    });

    if (github.hasNextPage(res)) {
	console.log("Current pageNumber === " + pageNumber);
    	getDataForPage(pageNumber+1);
    }



  })
};

getDataForPage(1);
