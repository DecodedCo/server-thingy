/* global $, require */

"use strict";

var http = require("http"),
  connect = require("connect"),
  open = require("open");

var fileLauncher = $(".file-launcher"),
  serverStopper = $(".server-stopper"),
  logEl = $("pre");

var expandSize = 400,
  expandInterval = 50;

var logs = [];

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

  logEl.html("Waiting for a connection...");
}

function stopServer() {
  server.close();
  clearLogs(0);
}

function logger(req, res, next) {
  var size = res.getHeader("content-length");

  if (size) {
    size = bytesToString(size);
  } else {
    size = "";
  }

  var time = new Date(Date.now());

  logs.push({
    time: time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds(),
    url: req.url,
    status: res.statusCode,
    size: size
  });

  clearLogs(50);

  updateLogs();

  next();
}

function updateLogs() {
  // TODO: Find a nicer way of doing this:
  var out = "",
    log;

  for (var i = 0; i < logs.length; i++) {
    log = logs[i];
    out += log.time + " - "
    out += log.status + " - ";
    out += log.url + "\n";
  }

  logEl.html(out);
  document.body.scrollTop = 10000;
}

function clearLogs(n) {
  while (logs.length > n) {
    logs.shift();
  }
}

function bytesToString(b) {
  var kb = 1024,
    mb = kb * 1024,
    gb = mb * 1024;

  if (b > gb) {
    return (b / gb).toFixed(2) + "GB";
  } else if (b > mb) {
    return (b / mb).toFixed(2) + "MB";
  } else if (b > kb) {
    return (b / kb).toFixed(2) + "KB";
  } else {
    return b + "B";
  }
}

function expand(contract) {
  var soFar = 0,
    interval = contract ? -expandInterval : expandInterval;

  if (contract) {
    $(document.body).removeClass("expanded");
  } else {
    $(document.body).addClass("expanded");
  }

  function doExpand () {
    if (soFar < expandSize) {
      window.resizeBy(interval, 0);
      soFar += expandInterval;
      window.requestAnimationFrame(doExpand);
    }
  }

  doExpand();
}

$(document).on("change", ".file-dialogue", function () {
  var dialogue = $(this),
    dir = dialogue.val();

  if (dir === "DECODEDSERVE_NOOP") {
    return;
  }

  launchServer(dir);

  fileLauncher.css("display", "none");
  serverStopper.css("display", "block");

  expand(false);

  dialogue.replaceWith($("<input class=\"file-dialogue\" type=\"file\" nwdirectory>"));
});

fileLauncher.on("click", function() {
  $(".file-dialogue").trigger("click");
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
