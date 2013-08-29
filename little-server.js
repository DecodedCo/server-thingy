/* global $, require */

"use strict";

var http = require("http"),
  connect = require("connect"),
  open = require("open");

var fileDialogue = $(".file-dialogue"),
  fileLauncher = $(".file-launcher"),
  serverStopper = $(".server-stopper");

var expandSize = 400,
  expandInterval = 50;

var server;

function launchServer(dir) {
  var app = connect();

  app.use(logger);

  // static files:
  app.use(connect.static(dir));

  // Directory listings:
  app.use(connect.directory(dir));

  server = http.createServer(app);

  server.listen(1337);
}

function stopServer() {
  server.close();
}

function logger(req, res, next) {
  // To do: Log request info ala serve

  next();
}

function expand(contract) {
  var soFar = 0,
    interval = contract ? -expandInterval : expandInterval;

  function doExpand () {
    if (soFar < expandSize) {
      window.resizeBy(interval, 0);
      soFar += expandInterval;
      window.requestAnimationFrame(doExpand);
    }
  }

  doExpand();
}

fileDialogue.on("change", function () {
  var dir = $(this).val();

  launchServer(dir);

  fileLauncher.css("display", "none");
  serverStopper.css("display", "block");

  expand(false);
});

fileLauncher.on("click", function() {
  fileDialogue.trigger("click");
});

serverStopper.on("click", function() {
  stopServer();

  fileLauncher.css("display", "block");
  serverStopper.css("display", "none");

  expand(true);
});

$(document).on("click", "a[href]", function(e) {
  e.preventDefault();
  open($(this).attr("href"));
});
