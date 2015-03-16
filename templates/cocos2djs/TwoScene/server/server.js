///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

///
/// A simple Node.js game server that:
/// 1. Sends static files as requested.
/// 2. Provides a basic API to game clients.
///
/// Keep it running on your own host using [forever](http://blog.nodejitsu.com/keep-a-nodejs-server-up-with-forever/). Remember the -g option on install.
///

///
/// ### Setup
///
var config = {},
	express = require("express"),
	fs = require("fs"),
	path = require("path"),
	server = express(),
	port = config.serverPort || 8000,
	protocolHttp = server.listen(port),
	self = {};
console.log("Started server on port: " + port);

///
/// ###  Static Files
///
/// Serve static files as requested.
///
server.use("/", express.static(__dirname + "/../Projects/html/"));
server.use("/project.json", express.static(__dirname + "/../project.json"));
server.use("/lib/", express.static(__dirname + "/../lib/"));
server.use("/Assets/", express.static(__dirname + "/../Assets/"));
server.get("/", function(req,res){
	res.sendfile("index.html");
});
server.get("/project.json", function(req,res){
	try {
		res.send(JSON.parse(fs.readFileSync(path.join(__dirname, "..", "project.json"))));
	} catch(e) {
		console.log("Error reading project.json");
	}
});

///
/// ###  Public API
///
/// Provide `api/counter` which increments the visitor number and returns it.
///
self.counter = 0;
server.get("/api/counter", function(req,res){
	self.counter = self.counter + 1;
	res.send(self.counter + "");
});
