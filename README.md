
RapidGame
=========

A Node-based templating system for rapidly creating cross-platform games for a variety of game engines, including Cocos2D-JS, Unity, Corona and Appcelerator Titanium.

What it does:

* Creates new cross-platform game projects from provided or custom templates, which include scenes, sprites, physics, sound and more. 

* Prebuilds libraries for Cocos2D X that virtually eliminate build, compile and link time, saving in aggregate hours during development, and allowing for a more rapid development cycle without having to wait - hence the name RapidGame.


Eliminate Grunt Work
--------------------

RapidGame provides:

 1. Tested game project templates for Cocos2D JS, Unity, Corona and Titanium
 2. A cross-platform game project creator
 3. A library prebuilder for Cocos2D X

The templates have:

 1. Cross-platform project files
 2. Resolution / ratio-independence
 3. Viewport setup
 4. Menu & Game scenes
 5. Sprites
 6. Custom TTF fonts
 7. Sound
 8. Music
 9. Physics
 10. HTTP game servers (HTML5-based platforms)

The project creator makes a copy of one of the templates, does a search and replace on the game title & package name, then installs any required modules. Viola. Your own rapidly-created game ready to go. Here's some example output from running the project creator:

	$ rapidgamepro create Corona "Sword Ball" org.myorg.swordball
	Rapidly creating a game
	Engine: Corona
	Template: TwoScene
	Copying project files
	Setting project name: Sword Ball
	Setting package name: org.myorg.swordball
	Done
	
	  Congratulations on creating a Corona game!
	  Run it by opening the `main.lua` file in the Corona Simulator.
	  Ready to code? Start with the `main.lua` file.
	  

The library prebuilder creates static libraries that virtually eliminate build times for the Cocos2D X engine (the native portion of Cocos2D JS). With hundreds of source files to be compiled, building Cocos2D X for just one platform can take at least five minutes. This can be a real time sink, especially when switching from the simulator to device triggers a rebuild.

The prebuilder automatically downloads the latest Cocos2D JS, patches it to ensure that it is bug-free, then prebuilds Cocos2D X for all possible platforms, configurations and architectures. It is then possible to compile and link native Cocos2D X games in seconds. Even better, the project creator will absolutely symlink to the location of the prebuilt libraries so your game projects stay lightweight and can be moved easily.


Create a Game in Under 30 Seconds
---------------------------------

You'll first need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).

There's no need to clone this repo, just install RapidGame:

	sudo npm install rapidgame -g

And, create a Unity game named "Zombie Matrix":

	rapidgame create unity "Zombie Matrix" com.myompany.zombiematrix

Or, a Cocos2D JS game named "Heck Yeah":

	rapidgame create cocos2d "Heck Yeah" org.myorg.heckyeah

For usage instructions:

	rapidgame --help


Pro Version
-----------

If you need cross-platform monetization, in-app purchasing, virtual economies, social networking, async multiplayer, analytics and/or ads then get [RapidGame Pro](http://www.binpress.com/app/rapidgame-pro-for-ios-android-facebook/1802). It has an example game called Lemonade Exchange written using the Cocos2D JS engine which includes all of the previously mentioned features and works on Facebook, iOS, Mac and Android. Support for more platforms is planned.


Breakout Clones
---------------

To test the validity of RapidGame, four Breakout clones were written for Unity, Corona, Cocos2D JS and Titanium. I found that using RapidGame can save up to ~80% of development time for simple games. To read more about the findings, see [Selecting a Cross-platform Game Engine](http://www.binpress.com/blog/2014/05/14/selecting-cross-platform-game-engine/).


More About Prebuilding
----------------------

The command to prebuild Cocos2D X static libraries used by Cocos2D JS on native platforms:

	rapidgame prebuild

When the command is finished, you'll have a directory (`~/Library/Developer/RapidGame` on Macs) with include files, java files, make files, Javascript bindings and library files for iOS, Mac and Android in Debug and Release mode for all available architectures.


Custom Cocos2D Projects
-----------------------

If you are just using Cocos2D X or you have your own custom project layout, you can still use the prebuilt libraries. Use this command to create a symlink to the libraries directory:

	cd MyGame && rapidgame init .

Then setup your Xcode target to reference the libraries and headers. Example:

	LIBRARY_SEARCH_PATHS = $(SRCROOT)/../lib/cocos2d/x/lib/$(CONFIGURATION)-iOS/$(PLATFORM_NAME)
	USER_HEADER_SEARCH_PATHS = $(inherited) $(SRCROOT)/../lib/cocos2d/x/include/cocos ...


Create Your Own Templates
-------------------------

It's possible to create your own game templates. Here's the step-by-step instructions:

 1. Create your game directory. If your game is called "Zombie Matrix", name the directory `Zombie Matrix`, including the space.
 
 2. Use the name of your game including any whitespace or punctation throughout your game project. RapidGame will automatically search and replace the title in most types of source and project files.
 
 3. If you'd like a file or directory renamed, make sure it starts with your game's title. For example, if you have `Zombie Matrix.xcodeproj` it will get changed to `MyNewGame.xcodeproj`.
 
 4. Whenever there's an instance of your package name, replace the beginning with `com.wizardfu.`, lowercase the title and remove any punctuation, so `com.mycompany.zombierevolution` becomes `com.wizardfu.zombierevolution`. This will get changed by the templating system when creating new game projects.
 
 5. Copy your game template to the `templates/<engine>` directory of RapidGame. On Mac / Linux this is `/usr/local/lib/node_modules/rapidgame`. You can use the `npm prefix -g` command to determine where Node modules are installed on your system. If you're on Mac OS X, the template is for Unity and it's called "Zombie Matrix" then the final directory would be `/usr/local/lib/node_modules/rapidgame/templates/unity/Zombie Matrix/`.

 6. Your template is now ready for testing. Try it out like this: `rapidgame create <engine> MyNewGame com.mycompany.mynewgame -t "Zombie Matrix" `.


Project Status
--------------

The `rapidgame` command runs on Mac or Linux. Windows support is planned.

Cocos2D JS win32 and linux project files are planned.


Contributing
------------

Submit pull requests or open issues as you see fit.


License
-------

RapidGame is licensed under the MIT license.

