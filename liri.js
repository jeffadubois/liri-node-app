var dotv    = require("dotenv").config();
var keys    = require("./keys.js");
var request = require("request");
var Spotify = require('node-spotify-api');
var Twitter = require('twitter');
var fs = require("fs");

var myTwitter = new Twitter(keys.twitter);
var spotify   = new Spotify(keys.spotify);


var getArtists = function(songItem) {
	var artistList = "";
	for (var i = 0; i < songItem.artists.length; i++) {
		if (i === 0){
			artistList = songItem.artists[i].name;
		}
		else{
			artistList = artistList + ", " + songItem.artists[i].name;
		}
	}
    return artistList;
}

var getTweets = function(userId){

	   var params = {user_id: userId};

       myTwitter.get('statuses/user_timeline', params ,function(err, tweets, response) {
       if (!err){
			 console.log("\n\nTotal number of tweets is " + tweets.length.toString() + ".\n\nMy tweets are (a maximum of 20 tweets will be displayed):\n>>>>>>>>>>>>>>>>>>>>>>>>\n");
			 var numTweetsToDisplay = tweets.length;
			 //display a maximum of 20 tweets
			 if (numTweetsToDisplay > 20){
				 numTweetsToDisplay = 20;
			 }
			 var displayNum = 0;
             var displayString = "";
             for (var i = 0; i < numTweetsToDisplay; i++) {
				 displayNum++;
				 displayString = "Tweet " + displayNum.toString() + ". \"" + tweets[i].text + "\"\n\nCreated on: " + tweets[i].created_at + "\n   " +  "\n>>>>>>>>>>>>>>>>>>>>>>>>\n";
				 console.log(displayString);
			 }
             console.log("\n\n");			 
			 //var result = JSON.stringify(tweets, null, 4);
			 //console.log(tweets);

		 }
		 else{
			  var errj = JSON.stringify(err, null, 4);
			  return console.log('Error occurred in acquiring tweets: ' + errj);
		 }
	   });
}

var getSongInfo = function(song_name){
		   //console.log("in spotify-this-song action the song is " + SongName  );
       spotify.search({ type: 'track', query: song_name, limit:10  }, function(err, data) {
       if (err) {
         return console.log('lsError occurred: ' + err);
       };
	     var myJSON = JSON.stringify(data, null, 4);
	     //console.log(myJSON);
         //console.log("Example of data[0] is" + data[0]);
         var numSongsToBeDisplayed = 10;
		 if (data.tracks.items.length < 10){
			 numSongsToBeDisplayed = data.tracks.items.length;
		 };
         console.log("\n\nDisplaying " + numSongsToBeDisplayed + " songs (maximum of 10 songs are displayed) related to \"" +  + "\"" + song_name + ":\n\n>>>>>>>>>>>>>>>>>>>>>>>>\n");
         var displayNum = 0;
         var displayString = "";		 
         for (var i = 0; i < numSongsToBeDisplayed; i++) {
				 displayNum++;
				 var artistList = getArtists(data.tracks.items[i]);
				 displayString = "Song " + displayNum.toString()
				 + ". \"" 
				 + data.tracks.items[i].name 
				 + "\"\n\n  Artists: " + artistList 
				 + "\n  Preview url: " 
				 +  data.tracks.items[i].preview_url 
				 + "\n  Album: " 
				 + data.tracks.items[i].album.name 
				 + "\n>>>>>>>>>>>>>>>>>>>>>>>>\n";
				 console.log(displayString);
			 };
		 });
}

var getMovieInfo = function(movie_name){
	        var requestString = "http://www.omdbapi.com/?t=" + movie_name + "&y=&plot=full&apikey=trilogy&tomatoes=true";		 
            request(requestString, function(error, response, body) {
              if (!error && response.statusCode === 200) {
				  console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n");
				  console.log("Movie Title: " + JSON.parse(body).Title);
				  console.log("Movie Year: " + JSON.parse(body).Year);
                  console.log("Movie Imdb rating is: " + JSON.parse(body).imdbRating);
				  console.log("Movie's Rotten Tomatoes rating is: " + JSON.parse(body).tomatoRotten);
				  console.log("Movie was made in country: " + JSON.parse(body).Country);
				  console.log("Movie's language is: " + JSON.parse(body).Language);
				  console.log("Movie's plot is:\n  " + JSON.parse(body).Plot);
				  console.log("\nMovie's actors were: " + JSON.parse(body).Actors);
				  console.log("\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\n\n");				  

              }
			  else{
				  var myError = JSON.stringify(error, null, 4);
				  console.log("error found " + myError);
			  }
          });

}

switch(process.argv[2]) {
    case 'my-tweets':
	   var UserId = "jeffadubois";
	   if (process.argv.length >  3){
	       UserId = process.argv[3];
	   }
        getTweets(UserId);
        break;
    case  'spotify-this-song':
	   var SongName = "The Sign";
	   if (process.argv.length >  3){
	       SongName = process.argv[3];
	   }
        getSongInfo(SongName);
        break;
	case 'movie-this':
	     var movieName = "Mr. Nobody";
	     if (process.argv.length >  3){
	       movieName = process.argv[3];
	     }
         getMovieInfo(movieName);		 
	    break;
	case 'do-what-it-says':
        fs.readFile("random.txt", "utf8", function(error, fdata) {

             // If the code experiences any errors it will log the error to the console.
             if (error) {
                  return console.log(error);
             }
            // We will then print the contents of data
             console.log(fdata);

            // Then split it by commas (to make it more readable)
             var dataArr = fdata.split(",");

			 if (dataArr.length === 2){
					var action = dataArr[0];
					var parameter = dataArr[1];
					if (action==="my-tweets"){
						getTweets(parameter);
					}
					else if (action==="spotify-this-song"){
						getSongInfo(parameter);
					}
					else if (action==="movie-this"){
						getMovieInfo(parameter);
					}						
			 }
			 else{
				 console.log("invalid content in random.txt");
			 }
			 
		});		
	    break;
    default:
	    //code block
        break;
}
