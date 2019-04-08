var express = require("express");
var querystring = require("querystring");
var request = require("request");
var path = require("path");

var api = require(path.join(__dirname, "apirequest.js"));

var config, app, access_token, refresh_token;
var delimiter = "@@@",
  authorized = false;


var init = function(c, a) {
  config = c; app = a;
  api.init(config, app);
  api.setLoginEPs();
}

// Set Enpoints
var setEndpoints = function() {
  app.post("/spotify/player_next", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_next(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_seek", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_seek(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/player_devices", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_devices(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_shuffle", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_shuffle(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_transfer", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_transfer(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_play", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_play(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_repeat", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_repeat(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_pause", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_pause(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_prev", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_prev(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/player_info", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_info(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/player_currentlyplaying", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_currentlyplaying(request.params, res_client);
    res_client.send(404);
  });

  app.post("/spotify/player_volume", (request, res_client) => { // TODO
    params = "";
    var res_server = api.player_volume(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/user_profile", (request, res_client) => { // TODO
    params = ""; 
    var res_server = api.user_profile(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/playlist_get", (request, res_client) => { // TODO
    params = "";  // w/ playlist_id!
    var res_server = api.playlist_get(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/playlist_getTracks", (request, res_client) => { // TODO
    params = "";  // w/ playlist_id!
    var res_server = api.playlist_get(request.params, res_client);
    res_client.send(404);
  });

  app.get("/spotify/playlist_getcoverimage", (request, res_client) => { // TODO
    params = "";  // w/ playlist_id!
    var res_server = api.playlist_getcoverimage(request.params, res_client);
    res_client.send(404);
  });
  
  app.get("/spotify/playlist_list", (request, res_client) => { // TODO
    params = "";  // w/ playlist_id!
    var res_server = api.playlist_list(request.params, res_client);
    res_client.send(404);
  });
};

module.exports = {
  init: init,
  setEndpoints: setEndpoints
};