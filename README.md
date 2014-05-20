
RapidGame
=========

RapidGame is a suite of tools that takes the grunt work out of game development.

More specifically:

 1. A collection of game project templates for Cocos2D JS, Unity, Corona and Appcelerator Titanium
 2. A cross-platform game project creator
 3. A library prebuilder for Cocos2D X that virtually eliminates build / compile / link time

The templates have:

 1. Cross-platform project files
 2. Resolution / ratio-independence
 3. Viewport setup
 4. Multiple scenes
 5. Sprites
 6. Sound
 7. Music
 8. Physics
 9. Simple asychronous game servers (HTML5-based platforms)

The project creator makes a copy of one of the templates, does a search and replace on the game title & package name, then installs any required Node modules. Viola. Your own rapidly-created game ready to go with scenes, sprites, physics, etc.

The library prebuilder creates `.a` files that virtually eliminate build times for the Cocos2D X engine (the native portion of Cocos2D JS). With hundreds of source files to be compiled, building Cocos2D X for just one platform can take at least five minutes. This can be a real time sink, especially when all one has to do is switch from the simulator to device to trigger a rebuild.

The prebuilder automatically downloads the latest Cocos2D JS, patches it to ensure that it's bug-free, then prebuilds Cocos2D X for all possible platforms, configurations and architectures. It takes awhile but it's worth every second. Even better, the project creator will absolutely symlink to the location of the prebuilt libraries so your game projects stay lightweight and can be moved easily.


Create a Game in Under 30 Seconds
---------------------------------

You'll first need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).

Install RapidGame:

	sudo npm install rapidgame -g

Create a Unity Breakout clone named BrickMan:

	rapidgame -e unity -t BrickBreaker BrickMan


Pro Version
-----------

If you need cross-platform monetization, in-app purchasing, virtual economies, social networking, async multiplayer, analytics and/or ads then get [RapidGame Pro](http://www.binpress.com/app/rapidgame-pro-for-ios-android-facebook/1802). It has an example game called Lemonade Exchange written using the Cocos2D JS engine which includes all of the previously mentioned features and works on Facebook, iOS, Mac and Android. Support for more platforms is planned.


Run
---

To run your Unity game just open the project in [Unity](https://unity3d.com/unity/download) and click the triangular Play button. The Breakout clone currently plays using the arrow keys to move the paddle and spacebar to launch the ball.

To run your [Corona](http://coronalabs.com/products/corona-sdk/starter/) game just run the Corona Simulator then open your `main.lua` file.

To run your [Cocos2D JS](http://cocos2d-x.org/product#cocos2dx-js) game in a browser just launch the server `cd MyGame && ./run-server` and visit [localhost:8000](http://localhost:8000).

To run your Cocos2D JS game natively for iOS or Mac, just open `proj.ios_mac/MyGame.xcodeproj` and Run. Note that you will need to have completed the `rapidgame prebuild` command so that Cocos2D X static libraries can be linked against.

To run your Cocos2D JS game for Android: `cd MyGame/proj.android && make && make run`. This also requires Cocos2D X static libraries, so make sure to `rapidgame prebuild`.

To run your [Titanium](http://www.appcelerator.com/titanium/) game just open Titanium Studio and File > Import... > Existing Projects into Workspace. Select your MyGame directory. Make sure you have the [Platino](http://lanica.co/products/platino/engine/) SDK installed.


More About Prebuilding
----------------------

The command to prebuild Cocos2D X static libraries used by Cocos2D JS on native platforms:

	rapidgame prebuild

When the command is finished, you'll have a directory (`~/Library/Developer/RapidGame` on Macs) with include files, java files, make files, Javascript bindings and library files for iOS, Mac and Android in Debug and Release mode for all available architectures.


Create Your Own Templates
-------------------------

It's possible to create your own game templates. Here's the step-by-step instructions:

 1. Create your game in a directory with the game name as the directory name. If your game is called "Zombie Revolution", name the directory `Zombie Revolution`, including the space.
 
 2. Use the name of your game (e.g. "Zombie Revolution") including any space or punctation freely throughout your game project. RapidGame is smart enough to automatically rename your game's title in most types of source files.
 
 3. If you'd like a file or directory renamed, make sure it starts with your game's title. For example, if you have `Zombie Revolution.xcodeproj` it will get changed to `MyNewGame.xcodeproj`.
 
 4. Whenever there's an instance of your package name, replace the beginning with `com.wizardfu.`, lowercase the title and remove any punctuation, so `com.mycompany.zombierevolution` becomes `com.wizardfu.zombierevolution`. This will get changed by the templating system when creating new game projects.
 
 5. Copy your game template to the `templates/<engine>` directory of RapidGame. On Mac / Linux this is `/usr/local/lib/node_modules/rapidgame`. You can use the `npm prefix -g` command to determine where Node modules are installed on your system. If you're on Mac OS X, the template is for Unity and it's called "Zombie Revolution" then the final directory would be `/usr/local/lib/node_modules/rapidgame/templates/unity/Zombie Revolution/`.

 6. Your template is now ready for testing. Try it out like this: `rapidgame -e unity -t "Zombie Revolution" MyNewGame`.


Project Status
--------------

The `rapidgame` command runs on Mac or Linux. Windows support is planned.

Breakout clones have been written for Unity, Corona, Cocos2D JS and Titanium.

Hello World has been written for Cocos2D JS including project files for iOS, Android and Mac. Win32 and Linux project files are planned.


Contributing
------------

Submit pull requests or open issues as you see fit.


License
-------

RapidGame is licensed under the MIT license.

