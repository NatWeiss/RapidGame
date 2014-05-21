//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// A simple Node.js game server that sends static files as requested.
//
var express = require("express"),
	fs = require("fs"),
	path = require("path"),
	server = express(),
	port = 8000,
	protocolHttp = server.listen(port);

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

console.log("Started server on port: " + port);
