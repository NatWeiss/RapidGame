//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// Server config file used by both client and server.
//

//
// ###  module
//
// Get the module object. Use Node.js style `module` or `module.exports` for the server. Use the `App` singleton for client.
//
var module = (module ? module.exports : (App ? App : {}));

//
// ###  module.serverAddress
//
// Specify the server's address without protocol (no "http://"). Primarily used by native clients. HTML5 clients can reference `window.location` to retrieve this programmatically.
//
// 1. Use `localhost` for development on a single machine.
// 2. Use the server's local IP address when other device's need to connect. Example: `192.168.0.1` or `10.0.0.1`.
// 3. Use the server's address and path when deploying. Example: `mycompany.com/mygame`
//
module.serverAddress = "localhost";

//
// ###  module.serverPort
//
// Specify the server's port. Can be left blank if using HTTP port 80. Reference this list of [well-known ports](http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers) as needed.
//
module.serverPort = 8000;
