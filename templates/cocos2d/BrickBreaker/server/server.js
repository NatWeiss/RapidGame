//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// A simple Node.js game server that sends static files as requested.
//
var express = require("express"),
	server = express(),
	port = 8000,
	protocolHttp = server.listen(port);

server.use("/", express.static(__dirname + "/../proj.html5/"));
server.use("/lib/", express.static(__dirname + "/../lib/"));
server.use("/res/", express.static(__dirname + "/../res/"));
server.use("/js/", express.static(__dirname + "/../js/"));
server.get("/", function(req,res){res.sendfile("index.html");});

console.log("Started server on port: " + port);
