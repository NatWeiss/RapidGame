//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// A simple Node.js game server that:
// 1. Sends static files as requested.
// 2. Provides a basic API to game clients.
//
// Keep it running on your own host using [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/). Remember the -g option on install.
//
// Here's a [post](http://stackoverflow.com/a/14272874) about using SSL and some example code:
//
/*
var https = require("https");
var fs = require("fs");
var protocolHttps = https.createServer({
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.pem")
}, server).listen(443);
*/

//
// ### Setup
//
var config = require("../js/ConfigServer"),
	express = require("express"),
	server = express(),
	protocolHttp = server.listen(config.serverPort || 8000),
	io = require("socket.io"),
	sockets = io.listen(protocolHttp),
	self = {};

console.log("Started server on port: " + config.serverPort);

//
// ###  Static Files
//
// Serve static files as requested.
//
server.use("/", express.static(__dirname + "/../proj.html5/"));
server.use("/lib/", express.static(__dirname + "/../lib/"));
server.use("/res/", express.static(__dirname + "/../res/"));
server.use("/js/", express.static(__dirname + "/../js/"));
server.get("/", function(req,res){res.sendfile("index.html");});

//
// ###  Public API
//
// Provide `api/counter` which increments the visitor number and returns it.
//
self.counter = 0;
server.get("/api/counter", function(req,res){
	self.counter = self.counter + 1;
	res.send(self.counter + "");
});
