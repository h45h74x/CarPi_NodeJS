var express = require("express");
var querystring = require("querystring");
var request = require("request");

var config, app, access_token, refresh_token;
var debuglog = true,
  doGET,
  doPOST,
  doPUT;

// # Misc Functions ############################################################

var init = function(c, a) {
  config = c; app = a;
}

function log(tag, text) {
  if (!debuglog) return;

  console.log("\n##[" + tag + "]##\n" + text + "\n");
}

var generateRandomString = function(length) {
  var text = "";
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
};

var setLoginEPs = function() {
  // Set Endpoints for login
  app.get("/spotify/login", (req, res) => {
    var state = generateRandomString(16);
    res.cookie(config.stateKey, state);
    res.redirect(
      "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: config.client_id,
          scope: config.scope,
          redirect_uri: config.redirect_uri,
          state: state
        })
    );
  });
  app.get("/spotify/callback", (req, res) => {
    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[config.stateKey] : null;

    if (state === null || state !== storedState)
      res.redirect("/#" + querystring.stringify({ error: "state_mismatch" }));
    else {
      res.clearCookie(config.stateKey);
      var authOptions = {
        url: "https://accounts.spotify.com/api/token",
        form: {
          code: code,
          redirect_uri: config.redirect_uri,
          grant_type: "authorization_code"
        },
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(config.client_id + ":" + config.client_secret).toString(
              "base64"
            )
        },
        json: true
      };

      request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
          access_token = body.access_token;
          refresh_token = body.refresh_token;
          authorized = true;
          res.redirect(
            "/04_music.html#" +
              querystring.stringify({
                access_token: access_token,
                refresh_token: refresh_token
              })
          );
        } else {
          authorized = false;
          res.redirect(
            "/#" + querystring.stringify({ error: "invalid_token" })
          );
        }
      });
    }
  });
  app.get("/spotify/refresh_token", (req, res) => {
    refresh_token = req.query.refresh_token;
    var authOptions = {
      url: "https://accounts.spotify.com/api/token",
      headers: {
        Authorization:
          "Basic " +
          new Buffer(config.client_id + ":" + config.client_secret).toString(
            "base64"
          )
      },
      form: {
        grant_type: "refresh_token",
        refresh_token: refresh_token
      },
      json: true
    };

    request.post(authOptions, (error, response, body) => {
      if (!error && response.statusCode === 200) {
        access_token = body.access_token;
        res.send({
          access_token: access_token
        });
      }
    });
  });

  //userLogin();
};

// # REST Base-Functions ############################################################

doGET = function(url, params, res_client, callback) {
  var options = {
    url: url,
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  request.get(options, (e, res_server) => {
    log("GET RES", res_server);
    if (callback) callback("", res_client, res_server, True);
  });
};

doPOST = function(url, params, res_client, callback) {
  var options = {
    url: url,
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  request.post(options, (e, res_server) => {
    log("POST RES", res_server);
    if (callback) callback("", res_client, res_server, True);
  });
};

doPUT = function(url, params, res_client, callback) {
  var options = {
    url: url,
    headers: { Authorization: "Bearer " + access_token },
    json: true
  };

  request.put(options, (e, res_server) => {
    log("PUT RES", res_server);
    if (callback) callback("", res_client, res_server, True);
  });
};

// # API Interaction ############################################################

// ### Player ###
// https://developer.spotify.com/documentation/web-api/reference-beta/#category-player

// POST - Skip to next track
// Query Params:  (device_id)
// Body Params:
var player_next = null;
player_next = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPOST(
      "https://api.spotify.com/v1/me/player/next",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Seek to specified timestamp in current track
// Query Params:  position_ms, (device_id)
// Body Params:
var player_seek = null;
player_seek = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/seek",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get available devices
// Query Params:
// Body Params:
var player_devices = null;
player_devices = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "https://api.spotify.com/v1/me/player/devices",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Toggle shuffle in current player
// Query Params: state, (device_id)
// Body Params:
var player_shuffle = null;
player_shuffle = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/shuffle",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Change device you are listening on
// Query Params: device_ids, (play)
// Body Params:
var player_transfer = null;
player_transfer = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Play new song or resume playback on active device
// Query Params: (device_id)
// Body Params: (context_uri), (uris), (offset), (position_ms)
var player_play = null;
player_play = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/play",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Set Repeat Mode to "repeat-track", "repeat-context" or "off"
// Query Params: state, (device_id)
// Body Params:
var player_repeat = null;
player_repeat = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/repeat",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Pause current playback
// Query Params: (device_id)
// Body Params:
var player_pause = null;
player_pause = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/pause",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// POST - Skip to previous track
// Query Params: (device_id)
// Body Params:
var player_prev = null;
player_prev = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPOST(
      "https://api.spotify.com/v1/me/player/previous",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get information about the current playback
// Query Params: (market)
// Body Params:
var player_info = null;
player_info = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "https://api.spotify.com/v1/me/player",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get the curently playing track
// Query Params: (market)
// Body Params:
var player_currentlyplaying = null;
player_currentlyplaying = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "https://api.spotify.com/v1/me/player/currently-playing",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// PUT - Set the Player volume in percent
// Query Params: volume_percent, (device_id)
// Body Params:
var player_volume = null;
player_volume = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doPUT(
      "https://api.spotify.com/v1/me/player/volume",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// ### User Profile ###
// https://developer.spotify.com/documentation/web-api/reference-beta/#category-user-profile

// GET - Get the user's profile
// Query Params:
// Body Params:
var user_profile = null;
user_profile = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "https://api.spotify.com/v1/me",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// ### Playlists ###
// https://developer.spotify.com/documentation/web-api/reference-beta/#category-playlists

// GET - Get a playlist
// Query Params:
// Body Params:
var playlist_get = null;
playlist_get = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "GET https://api.spotify.com/v1/playlists/" + params.playlist_id,
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get info about all tracks in a playlist
// Query Params: (fields), (limit), (offset), market [use string "from_token"!]
// Body Params:
var playlist_getTracks = null;
playlist_getTracks = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "GET https://api.spotify.com/v1/playlists/" +
        params.playlist_id +
        "/tracks",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get a playlist cover image
// Query Params:
// Body Params:
var playlist_getcoverimage = null;
playlist_getcoverimage = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "GET https://api.spotify.com/v1/playlists/" +
        params.playlist_id +
        "/images",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

// GET - Get all playlists of user
// Query Params:  (limit) (offset)
// Body Params:
var playlist_list = null;
playlist_list = function(params, res_client, res_server, isCallback) {
  if (!isCallback)
    doGET(
      "GET https://api.spotify.com/v1/me/playlists",
      params.queryParams,
      res_client,
      callback
    );
  else return res_server;
};

module.exports = {
  init: init,
  setLoginEPs: setLoginEPs,

  player_next: player_next,
  player_seek: player_seek,
  player_devices: player_devices,
  player_shuffle: player_shuffle,
  player_transfer: player_transfer,
  player_play: player_play,
  player_repeat: player_repeat,
  player_pause: player_pause,
  player_prev: player_prev,
  player_info: player_info,
  player_currentlyplaying: player_currentlyplaying,
  player_volume: player_volume,
  user_profile: user_profile,
  playlist_get: playlist_get,
  playlist_getTracks: playlist_getTracks,
  playlist_getcoverimage: playlist_getcoverimage,
  playlist_list: playlist_list
};
