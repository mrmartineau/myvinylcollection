/**
 * TODO:
 * Needs a promise so the releases render at the right time
 * Style the page ✔︎
 * Deploy to Heroku ✔︎
 * Link to the release
 */

var Discogs = require('disconnect').Client;
var db = new Discogs().database();
var express = require('express');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));


var dis = new Discogs({
	consumerKey: process.env.discogs_consumerKey,
	consumerSecret: process.env.discogs_consumerSecret
}).user().collection();


var releases = [];
dis.releases('MrMartineau', 0, {page: 1, per_page: 200}, function(err, data){
	//console.log(data.releases[0]);

	// Create a dictionary of releases in a more palatable format
	for (var i = 0; i < data.releases.length; i++) {
		releases[i] = {
			artist : data.releases[i].basic_information.artists[0].name,
			releaseName : data.releases[i].basic_information.title,
			img : data.releases[i].basic_information.thumb,
			uri: data.releases[i].basic_information.uri,
			year: data.releases[i].basic_information.year
		};
	}

	// Sort the releases alphabetically
	releases.sort(function(a,b){
		if (a.artist > b.artist) {
			return 1;
		}
		if (a.artist < b.artist) {
			return -1;
		}
		// a must be equal to b
		return 0;
	});
	// console.log(releases);
});


app.get('/', function(req, res) {
	res.render('index', { title: 'Zander\'s Vinyl Collection', releases: releases});
});

app.listen(process.env.PORT || 3000);
console.error('APP STARTED');
