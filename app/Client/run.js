var express = require("express");
var request = require("request");
var cors = require("cors");
var querystring = require("querystring");
var cookieParser = require("cookie-parser");
var fs = require("fs");
var path = require("path");

global.config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")));

var app = express();
var spotifyapi = require(path.join(__dirname, "views", "js", "spotify", "spotify.js"));
var show_splash = true;

// # Methods ############################################################

function init() {
  app.use(express.static(path.join(__dirname, "views")));
  app.use(cors());
  app.use(cookieParser());

  spotifyapi.init(config.spotify, app);

  app.get("/", (req, res) => {
    if (show_splash) {
      show_splash = false;
      res.redirect("/01_splash.html");
    } else res.redirect("/02_menu.html");
  });
  app.get("/index", (req, res) => res.redirect("/"));
}

// # Run #################################################################

init();
app.listen(config.client.port);
console.log("Listening on " + config.client.port);
