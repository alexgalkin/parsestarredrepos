var fs = require('fs');
var GitHubApi = require("github");

var github = new GitHubApi({
    // optional
    debug: true,
    protocol: "https",
    host: "api.github.com", // should be api.github.com for GitHub
    headers: {
        "user-agent": "GitHub-Repo-Analytics" // GitHub is happy with a unique user agent
    },
    Promise: require('bluebird'),
    followRedirects: false,
    timeout: 5000
});

github.authenticate({
    type: "oauth",
    key: 'CLIENT_ID',
    secret: 'CLIENT_SECRET'
});

var today = new Date();
var date = today.getFullYear() + '-' + (((today.getMonth()+1) < 10)?'0':'') + (today.getMonth()+1) + '-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();


var Db = require('mongodb').Db,
    Server = require('mongodb').Server,
    MongoClient = require('mongodb').MongoClient;


function addDateTime (element, index, array) {
    array[index].date = date;
    array[index].time = time;
}

var getDataForPage = function (pageNumber, result) {

  github.activity.getStarredReposForUser({
  username: "GITHUB_USERNAME",
  page: pageNumber,
  per_page: 100
  }, function(err, res) {
    console.log(JSON.stringify(res));

    fs.writeFile("/Users/alexg/projects/nikmobile/parsestarredrepos/" + date + "-" + time + '-' + pageNumber + ".json", JSON.stringify(res), function(err) {
    if(err) {
        return console.log(err);
    } else {
        console.log('storing results in mongodb...');

        MongoClient.connect("mongodb://MONGO_USER:MONGO_PASS@MONGO_HOST:MONGO_PORT/MONGO_DB", function(err, db) {
            if (err) {
                console.log(JSON.stringify(err));
            }
           var collection = db.collection("repostats");

            var arrayOfRepoData = res.data;

            arrayOfRepoData.forEach(addDateTime);

            collection.insertMany(arrayOfRepoData, null, function() {
                console.log('saving data: done');
                db.close();
            });




        });
    }

        console.log('saving file: done');
    });

    if (github.hasNextPage(res)) {
	console.log("Current pageNumber === " + pageNumber);
    	getDataForPage(pageNumber+1);
    }



  })
};

getDataForPage(1);
