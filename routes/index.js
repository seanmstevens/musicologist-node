var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Musicologist' });
});

// Spotify API setup

const request = require('request');
const keys = require('./keys').spotifyKeys;
let token;
let results = [];

// API token request

const authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': 'Basic ' + (new Buffer(keys.client_id + ':' + keys.client_secret).toString('base64'))
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

request.post(authOptions, function(error, response, body) {
  token = body.access_token;
});

// Handling the AJAX get request

router.get('/search', function(req, res) {

  results = [];

  let query = req.query.term;;

  let searchOptions = {
    url: "https://api.spotify.com/v1/search?q=" + query + "&type=playlist&limit=20",
    headers: {
      'Authorization': 'Bearer ' + token
    },
    json: true
  };

  request.get(searchOptions, function(error, response, body) {

    if (response.statusCode === 200) {
      let searchResults = Array.from(body.playlists.items);

      // Filtering results to playlists with at least 10 tracks
      let filteredResults = searchResults.filter((value, index) => value.tracks.total >= 10);

      if (filteredResults.length === 0) {
        res.json(results);
      } else {
        let playlistLength = filteredResults.length;
        let randomPlaylist = Math.floor(Math.random() * playlistLength);

        const playlistReqOptions = {
          url: filteredResults[randomPlaylist].tracks.href,
          headers: {
            'Authorization': 'Bearer ' + token
          },
          json: true
        };

        request.get(playlistReqOptions, function(error, response, body) {
          if (body.items !== 'undefined') {
            let validTracks = 0;
            let i = 0;
            while (i < body.items.length && validTracks < 20) {
              if (body.items[i].track !== null) {
                let track = body.items[i].track;
                results.push({"artist": track.artists[0].name,
                              "track": track.name,
                              "album": track.album.name});
                validTracks += 1;
              }
              i++;
            }
          }
          res.json(results);
        });
      }
    } else {
      res.json(results);
    }
  });
});

module.exports = router;
