	__________              .__    .___________                       
	\______   \____  ______ |__| __| _/  _____/_____    _____   ____  
	 |       _|__  \ \____ \|  |/ __ /   \  ___\__  \  /     \_/ __ \ 
	 |    |   \/ __ \|  |_> >  / /_/ \    \_\  \/ __ \|  Y Y  \  ___/ 
	 |____|_  (____  /   __/|__\____ |\______  (____  /__|_|  /\___  >
	        \/     \/|__|           \/       \/     \/      \/     \/ 

RapidGame is a commandline tool for Mac and Windows (Linux support is planned) which:

1. Prebuilds cocos2d-x / cocos2d-js libraries for Mac, iOS, Android and Windows for multiple architectures and configurations, virtually eliminating the need to ever rebuild cocos2d-x or the Javascript bindings.

2. A game project templating system for creating cross-platform games for a variety of game engines, including cocos2d-x, cocos2d-js, Unity, Corona and Appcelerator Titanium. The default game template creates a simple Breakout clone with a menu and game scene.


Updates
-------

* Feb 19, 2015: Fixed a bug in Xcode projects (reference to script folder).
* Feb 7, 2015: Prebuilder updated for cocos2d-js 3.2 final / cocos2d-x 3.3.
* Dec 28, 2014: Prebuilder updated for cocos2d-js 3.2 rc0 / cocos2d-x 3.3.
* Aug 14, 2014: Prebuilder updated for cocos2d-js 3.0 rc2 / cocos2d-x 3.2.


Create a Game in Under 30 Seconds
---------------------------------

You'll first need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).

There's no need to clone this repo, just install RapidGame:

	sudo npm install rapidgame -g

And, create a Unity game named "Zombie Matrix":

	rapidgame create unity "Zombie Matrix" com.myompany.zombiematrix

Or, a cocos2d-x / cocos2d-js game named "Heck Yeah":

	rapidgame create cocos2d "Heck Yeah" org.myorg.heckyeah

For usage instructions:

	rapidgame --help


Pro Version
-----------

If you need cross-platform monetization, in-app purchasing, virtual economies, social networking, async multiplayer, analytics and/or ads then get [RapidGamePro](http://www.binpress.com/app/rapidgame-pro-for-ios-android-facebook/1802). It has an example game called Lemonade Exchange written using the cocos2d-js engine which includes all of the previously mentioned features and works on Facebook, iOS, Mac and Android. Support for more platforms is planned.


Eliminate Grunt Work
--------------------

RapidGame provides:

 1. Tested game project templates for cocos2d-x / cocos2d-js, Unity, Corona and Titanium
 2. A cross-platform game project creator
 3. A library prebuilder for cocos2d-x

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
	  

The library prebuilder creates static libraries that virtually eliminate build times for the cocos2d-x engine (the native portion of cocos2d-js). With hundreds of source files to be compiled, building cocos2d-x for just one platform can take at least five minutes. This can be a real time sink, especially when switching from the simulator to device triggers a rebuild.

The prebuilder automatically downloads the latest cocos2d-js, patches it to ensure that it is bug-free, then prebuilds cocos2d-x for all possible platforms, configurations and architectures. It is then possible to compile and link native cocos2d-x games in seconds. Even better, the project creator will absolutely symlink to the location of the prebuilt libraries so your game projects stay lightweight and can be moved easily.


What's the difference between a RapidGame project and a "normal" cocos2d-x project?
---------------------------------------------------------------------------------------

A project created by RapidGame uses exactly the same underlying API as cocos2d-x / cocos2d-js. One can still get the running scene, for example, like this `cc.director.getRunningScene()` (Javascript) or this `cocos2d::Director::getInstance()->getRunningScene()` (C++).

RapidGame extends upon the cocos2d-js API with the [Game](Game.html) object. This object provides methods which are commonly used in game development, but were missing from cocos2d-js at the time of writing. `Game.rand(5)`, for example, returns a random integer between 0 and 5.

While the underlying API stays the same, the file / folder structure of a project created by RapidGame is different than that of a "normal" cocos2d-js project. A normal project is created with the `cocos` command:

	cocos new -p com.mycompany.mygame -l js -d MyGame

This results in a project folder approximately 500 MB which contains all the files necessary to build cocos2d-x from scratch. Subfolders include:

	frameworks/ - All cocos2d-html5 and cocos2d-x source files, as well as project files for the game
	res/ - Game assets
	runtime/ - An executable which can run the iOS Simulator from the commandline
	src/ - The Javascript files
	tools/ - Miscellaneous tools

By contrast, a RapidGame project is only 2 MB (because it symlinks to cocos2d-html5 and the prebuilt cocos2d-x libraries) and has a more organized folder structure:

	Assets/ - The game assets and Javascript files
	lib/ - A symlink to the prebuilt cocos2d-x libraries and cocos2d-html5
	Projects/ - The project files for the game
	Server/ - The server which provides an API and serves files for the HTML5 version of the game

Inside the project files there are other differences. Take the Xcode project as an example. The normal cocos2d-js project is setup to build all of cocos2d-x, depends on several sub-projects (Targets > Build Phases > Target Dependencies) and references several **User Header Search Paths** (example: `$(SRCROOT)/../../js-bindings/cocos2d-x`) within the `frameworks` folder.

The RapidGame project is more efficient, relying on the symlinked `lib` folder. Instead of depending on sub-projects and rebuilding all of cocos2d-x, it uses two **Other Linker Flags** to include the prebuilt cocos2d-x libraries (`-lcocos2dx-prebuilt`) and specifies an additional **Library Search Path** in which to find them: `$(SRCROOT)/../lib/cocos2d/x/lib/$(CONFIGURATION)-iOS/$(PLATFORM_NAME)`. **User Header Search Paths** also use the symlink, `$(SRCROOT)/../lib/cocos2d/x/include/cocos`, so that by simply swapping the `lib` folder one can upgrade to a newer prebuilt version of cocos2d-js/x.


Breakout Clones
---------------

To test the validity of RapidGame, four Breakout clones were written for Unity, Corona, cocos2d-js and Titanium. I found that using RapidGame can save up to ~80% of development time for simple games. To read more about the findings, see [Selecting a Cross-platform Game Engine](http://www.binpress.com/blog/2014/05/14/selecting-cross-platform-game-engine/).


More About Prebuilding
----------------------

The command to prebuild cocos2d-x static libraries used by cocos2d-js on native platforms:

	rapidgame prebuild

When the command is finished, you'll have a directory (`~/Library/Developer/RapidGame` on Macs) with include files, java files, make files, Javascript bindings and library files for iOS, Mac and Android in Debug and Release mode for all available architectures.


Development Platforms
---------------------

RapidGame can be used on any platform that is capable of running Node.js.

The cocos2dx library prebuilder currently works on the following development platforms:

* Mac
* Windows

Linux support is planned.


Custom Cocos2D Projects
-----------------------

If you are just using cocos2d-x or you have your own custom project layout, you can still use the prebuilt libraries. Use this command to create a symlink to the libraries directory:

	cd MyGame && rapidgame init .

Then setup your Xcode target to reference the headers. Example:

	USER_HEADER_SEARCH_PATHS = $(inherited)
		$(SRCROOT)/../lib/cocos2d/x/include/cocos
		$(SRCROOT)/../lib/cocos2d/x/include/cocos/2d
		...

And the libraries:

	LIBRARY_SEARCH_PATHS = $(SRCROOT)/../lib/cocos2d/x/lib/$(CONFIGURATION)-iOS/$(PLATFORM_NAME)

Then link with the library:

	OTHER_LDFLAGS = -lcocos2dx-prebuilt


Create Your Own Templates
-------------------------

It's possible to create your own game templates. Here's the step-by-step instructions:

 1. Create your game directory. If your game is called "Zombie Matrix", name the directory `Zombie Matrix`, including the space.
 
 2. Use the name of your game including any whitespace or punctation throughout your game project. RapidGame will automatically search and replace the title in most types of source and project files.
 
 3. If you'd like a file or directory renamed, make sure it starts with your game's title. For example, if you have `Zombie Matrix.xcodeproj` it will get changed to `MyNewGame.xcodeproj`.
 
 4. Whenever there's an instance of your package name, replace the beginning with `com.wizardfu.`, lowercase the title and remove any punctuation, so `com.mycompany.zombierevolution` becomes `com.wizardfu.zombierevolution`. This will get changed by the templating system when creating new game projects.
 
 5. Copy your game template to the `templates/<engine>` directory of RapidGame. On Mac / Linux this is `/usr/local/lib/node_modules/rapidgame`. You can use the `npm prefix -g` command to determine where Node modules are installed on your system. If you're on Mac OS X, the template is for Unity and it's called "Zombie Matrix" then the final directory would be `/usr/local/lib/node_modules/rapidgame/templates/unity/Zombie Matrix/`.

 6. Your template is now ready for testing. Try it out like this: `rapidgame create <engine> MyNewGame com.mycompany.mynewgame -t "Zombie Matrix" `.


Contributing
------------

Submit pull requests or open issues as you see fit.


License
-------

RapidGame is licensed under the MIT license.


