/**
 * TODO:
 * Needs a promise so the releases render at the right time ✔︎
 * Style the page ✔︎
 * Deploy to Heroku ✔︎
 * Link to the release
 * Populate releases object before get request
 */

var Discogs = require('disconnect').Client;
var db = new Discogs().database();
var express = require('express');
var Promise = require('es6-promise').Promise;

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));


var dis = new Discogs({
	consumerKey: process.env.discogs_consumerKey,
	consumerSecret: process.env.discogs_consumerSecret
}).user().collection();

var releases = [];

/**
 * Get the full collection and sort it alphabetically
 */
function getCollection(url) {
	// Return a new promise.
	return new Promise(function(resolve, reject) {
		dis.releases('MrMartineau', 0, {page: 1, per_page: 200}, function(err, data){
			// console.log(data.releases[0]);

			// Create a dictionary of releases in a more palatable format
			for (var i = 0; i < data.releases.length; i++) {
				releases[i] = {
					artist : data.releases[i].basic_information.artists[0].name,
					releaseName : data.releases[i].basic_information.title,
					img : data.releases[i].basic_information.thumb,
					id: data.releases[i].id,
					url: undefined,
					year: data.releases[i].basic_information.year
				};
			}

			// console.log("releases", releases);

			// Sort the releases alphabetically
			releases.sort(function(a,b){
				if (a.artist > b.artist) {
					return 1;
				}
				if (a.artist < b.artist) {
					return -1;
				}
				return 0; // a must be equal to b
			});

			resolve(releases);
		});
	});
}


/**
 * Get the url for each release
 */
function getUrl(releases) {
	return new Promise(function(resolve, reject) {
		for (var i = 0; i < releases.length; i++) {

			db.release(releases[i].id, function(err, data){
				// console.log("id",releases[i].id,"uri", data.uri, releases[i]);
				releases[i].url = data.uri;
			});
		}

		// console.log("releases", releases);
		resolve(releases);
	});
}

var organisedReleases = [];

/**
 * Create the releases array
 */
getCollection().then(function(response) {
	// console.log("Success 1!", response);
	return getUrl(response);
}).then(function(response) {
	// console.log("Success 2!", response);
	organisedReleases = response;
});

console.log("organisedReleases", organisedReleases);

app.get('/', function(req, res) {
	res.render('index', { title: 'Zander\'s Vinyl Collection', releases: organisedReleases});
});

app.listen(process.env.PORT || 3000);
console.error('APP STARTED');
