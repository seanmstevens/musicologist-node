var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// Spotify API setup

const request = require('request');

const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: {
      'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
    },
    form: {
      grant_type: 'client_credentials'
    },
    json: true
};

request.post(authOptions, function(error, response, body) {
    const token = body.access_token;
    const searchOptions = {
        url: "https://api.spotify.com/v1/search?q=french+electronica&type=playlist&limit=10",
        headers: {
          'Authorization': 'Bearer ' + token
        },
        json: true
    };
    request.get(searchOptions, function(error, response, body) {
        console.log(body.playlists.items.length);
        if (body.playlists.items.length === 0) {
            console.log("No results. Try narrowing your search.");
        } else {
            let playlistLength = body.playlists.items.length;
            let randomPlaylist = Math.floor(Math.random() * playlistLength);
            console.log(randomPlaylist);
            const playlistReqOptions = {
                url: body.playlists.items[randomPlaylist].tracks.href,
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
            request.get(playlistReqOptions, function(error, response, body) {
                let i = 0;
                while (i < body.items.length && i < 20) {
                    let track = body.items[i].track;
                    console.log(track.artists[0].name + " - " + track.name + " (Album: " + track.album.name + ")");
                    i++;
                }
            });
        }
    });
});

module.exports = router;
