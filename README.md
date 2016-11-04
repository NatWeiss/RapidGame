[![](https://raw.githubusercontent.com/NatWeiss/RapidGame/master/RapidGame.jpg)](http://youtu.be/SOJs2DwIxOU)

	__________              .__    .___________
	\______   \____  ______ |__| __| _/  _____/_____    _____   ____
	 |       _|__  \ \____ \|  |/ __ /   \  ___\__  \  /     \_/ __ \
	 |    |   \/ __ \|  |_> >  / /_/ \    \_\  \/ __ \|  Y Y  \  ___/
	 |____|_  (____  /   __/|__\____ |\______  (____  /__|_|  /\___  >
	        \/     \/|__|           \/       \/     \/      \/     \/

RapidGame is a commandline tool for Mac, Windows and Linux which:

1. Prebuilds cocos2d-x libraries for Windows, Mac, Linux, iOS and Android for multiple architectures and configurations, virtually eliminating the need to ever rebuild.

2. Creates cross-platform game projects from templates for a variety of game engines. Supports cocos2d-x, Unity, Corona and Appcelerator Titanium. The default game template creates a simple Breakout clone with a menu and game scene.

Prefer somebody explaining and showing it? Check out the [overview video](http://youtu.be/SOJs2DwIxOU).


Create a Game in Under 30 Seconds
---------------------------------

You'll first need [Node.js](https://nodejs.org/en/download/) and [Git](http://git-scm.com/downloads).

There's no need to clone this repo, just install RapidGame:

	sudo npm install rapidgame -g

Or, on Windows leave off the `sudo` and ensure that `git` is a part of your PATH:

	npm install rapidgame -g

And, create a cocos2d-x game named "HeckYeah" (run this as administrator on Windows):

	rapidgame create cocos2dx "HeckYeah" org.myorg.heckyeah

Or, a Unity game named "ZombieMatrix":

	rapidgame create unity "ZombieMatrix" com.mycompany.zombiematrix

More:

	rapidgame --help


About Prebuilding
-----------------

The command to prebuild cocos2d-x static libraries is:

	rapidgame prebuild

When the command is finished, you'll have a directory (`~/.rapidgame` on Mac or Linux, and `C:\Users\[USERNAME]\.rapidgame` on Windows) with headers, java files, make files and prebuilt library files for all buildable architectures and configurations available on the current development platform.

You can specify which platform you want to prebuild:

	rapidgame prebuild mac
	rapidgame prebuild ios
	rapidgame prebuild windows
	rapidgame prebuild linux
	rapidgame prebuild android

Or refresh the headers:

	rapidgame prebuild headers

You can specify a custom cocos2d-x source root:

	rapidgame prebuild --src path/to/cocos2d-x

And even tag the prebuilt directory name differently:

	rapidgame prebuild --dest 3.9-custom

The following command uses a custom cocos2d-x source root and places the resultant libraries in `~/.rapidgame/3.9-custom`:

	rapidgame prebuild --src path/to/custom/cocos2d-x --dest 3.9-custom

You can also specify a custom directory prefix where RapidGame stores it's files:

	rapidgame prebuild --prefix C:\somewhere

Create a symlink in the current directory to the current static libraries:

	rapidgame init .

Or specify which prebuilt files to use:

	rapidgame init . --dest 3.9-custom

Or show all the directories RapidGame might use:

	rapidgame show
	
		Rapidgame lives here: /Users/nat/.rapidgame
		Latest static libs and headers: /Users/nat/.rapidgame/3.9
		Static libs and headers have been built: YES


Development Platforms
---------------------

RapidGame can be used on any platform that is capable of running Node.js.

The cocos2d-x library prebuilder currently works on the following development platforms:

* Mac
* Windows
* Linux


Requirements
------------

Mac: Xcode 5 or newer, and [Node.js](https://nodejs.org/en/download/).

Windows: [Visual Studio](https://www.visualstudio.com/en-us/products/free-developer-offers-vs.aspx) 2012 or newer, and [Node.js](https://nodejs.org/en/download/). Read the [Windows Notes](#windows-notes) for additional notes you should be aware of.

Linux: run `cocos2d-x/build/install-deps-linux.sh` and ensure that [Node.js](https://nodejs.org/en/download/) is installed.

Android (any platform): you'll need to install the Android [SDK](http://developer.android.com/sdk/installing/) and [NDK](http://developer.android.com/tools/sdk/ndk/), then run the SDK Manager and install the latest *Tools*, *Platform Tools* and *Build-tools*. Finally, make sure that the environment variable `NDK_ROOT` is the path to the NDK.


Windows Notes
-------------

1. **The `rapidgame create` or `rapidgame prebuild` command must be run as administrator.** This allows symlinks to be properly created.
2. If you have freshly installed Visual Studio, then you will need to run it once in order for it to download the necessary build tools.
3. To prebuild Android libraries, please set the `NDK_ROOT` environment variable. You can do this permanently for all command prompt sessions by going: Computer > Properties > Advanced System Settings > Environment System Variables. Confirm this with `echo %PATH%` or just try to run `ndk-build` from any directory.


Updates
-------

* Nov 3, 2016: Removed the feature of automatically downloading cocos2d-x source in favor of using the source folder specified by the user.
* Jan 27, 2016: Linux support. Can specify cocos2d-x source folder. Simplified Android prebuild so it doesn't require cygwin on Windows.
* Jan 10, 2016: Updated to cocos2d-x 3.9.
* Aug 17, 2015: Fixes for Visual Studio 2015.
* Aug 11, 2015: On Windows, the path to MSBuild.exe, Lib.exe and VCTargetsPath can be set manually in case they cannot be automatically located.
* Aug 2, 2015: Upgraded to cocos2d-x 3.7 (cocos2d-js and cocos2d-x have now been merged into just cocos2d-x).
* Jun 2, 2015: Can now prebuild Android on Windows thanks to [Samuel Ørsnæs](https://github.com/samoersnaes).
* May 4, 2015: Upgraded to cocos2d-x 3.6 / cocos2d-js 3.6.
* Mar 15, 2015: Fixed another bug related to MSBuild path on Windows (thanks, [Adam Yocum](https://github.com/adamyocum)). Fixed the cocos2d-x Android template.
* Feb 24, 2015: Now has separate cocos2d-x and cocos2d-js templates. Fixed a bug on Windows: "Unable to find MSBuild path."
* Feb 19, 2015: Fixed a bug in Xcode projects (reference to script folder).
* Feb 7, 2015: Prebuilder updated for cocos2d-js 3.2 final / cocos2d-x 3.3.
* Dec 28, 2014: Prebuilder updated for cocos2d-js 3.2 rc0 / cocos2d-x 3.3.
* Aug 14, 2014: Prebuilder updated for cocos2d-js 3.0 rc2 / cocos2d-x 3.2.


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

The project creator makes a copy of one of the templates, does a search and replace on the game title & package name, then installs any required modules. Viola. Your own rapidly-created game ready to go. Here is some example output from running the project creator:

	$ rapidgame create Corona "SwordBall" org.myorg.swordball
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
	  

The library prebuilder creates static libraries that virtually eliminate build times for the cocos2d-x engine. With hundreds of source files to be compiled, building cocos2d-x for just one platform can take at least five minutes. This can be a real time sink, especially when switching from the simulator to device triggers a rebuild.

The prebuilder can use a custom cocos2d-x root folder, or automatically download, patch and prebuild the latest version of cocos2d-x. It will then be possible to compile and link native cocos2d-x games in seconds. Even better, the project creator will absolutely symlink to the location of the prebuilt libraries so that game projects stay lightweight and can be moved easily. A regular cocos2d-x game project directory can be half a gigabyte or more. A RapidGame project is a couple megabytes.


What's the difference between a RapidGame project and a "normal" cocos2d-x project?
---------------------------------------------------------------------------------------

A project created by RapidGame uses exactly the same underlying API as cocos2d-x / cocos2d-js. One can still get the running scene, for example, like this `cocos2d::Director::getInstance()->getRunningScene()` (C++) or this `cc.director.getRunningScene()` (Javascript).

RapidGame extends upon the cocos2d-js API with the [Game](http://htmlpreview.github.io/?https://github.com/NatWeiss/RapidGame/blob/master/docs/Game.html) object. This object provides methods which are commonly used in game development, but were missing from cocos2d-js at the time of writing. `Game.rand(5)`, for example, returns a random integer between 0 and 5.

While the underlying API stays the same, the file / folder structure of a project created by RapidGame is different than that of a "normal" cocos2d-x project. A normal project is created with the `cocos` command:

	cocos new -p com.mycompany.mygame -l js -d MyGame

This results in a project folder approximately 500 MB which contains all the files necessary to build cocos2d-x from scratch. Subfolders include:

	frameworks/ - All cocos2d-js and cocos2d-x source files, as well as project files for the game
	res/ - Game assets
	runtime/ - An executable which can run the iOS Simulator from the commandline
	src/ - The Javascript files
	tools/ - Miscellaneous tools

By contrast, a RapidGame project is only 2 MB (because it symlinks to the prebuilt cocos2d-x libraries) and has a more organized folder structure:

	Assets/ - The game assets and Javascript files
	lib/ - A symlink to the prebuilt cocos2d-x libraries
	Projects/ - The project files for the game
	Server/ - The server which provides an API and serves files for the HTML5 version of the game (cocos2d-js only)

Inside the project files there are other differences. Take the Xcode project as an example. The normal cocos2d-x project is setup to build all of cocos2d-x, depends on several sub-projects (Targets > Build Phases > Target Dependencies) and references several **User Header Search Paths** (example: `$(SRCROOT)/../../js-bindings/cocos2d-x`) within the `frameworks` folder.

The RapidGame project is more efficient, relying on the symlinked `lib` folder. Instead of depending on sub-projects and rebuilding all of cocos2d-x, it uses two **Other Linker Flags** to include the prebuilt cocos2d-x libraries (`-lcocos2dx-prebuilt`) and specifies an additional **Library Search Path** in which to find them: `$(SRCROOT)/../lib/cocos2d/x/lib/$(CONFIGURATION)-iOS/$(PLATFORM_NAME)`. **User Header Search Paths** also use the symlink, `$(SRCROOT)/../lib/cocos2d/x/include/cocos`, so that by simply swapping the `lib` folder one can upgrade to a newer prebuilt version of cocos2d-js/x.


Custom cocos2d-x/js Projects
----------------------------

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

 1. Create your game directory. If your game is called "ZombieMatrix", name the directory `ZombieMatrix`.
 
 2. Use the name of your game throughout your game project. RapidGame will automatically search and replace the title in most types of source and project files.
 
 3. If you prefer for a file or directory renamed, make sure it starts with your game's title. For example, if you have `ZombieMatrix.xcodeproj` it will get changed to `MyNewGame.xcodeproj`.
 
 4. Whenever there is an instance of your package name, replace the beginning with `com.wizardfu.`, lowercase the title and remove any punctuation, so `com.mycompany.zombierevolution` becomes `com.wizardfu.zombierevolution`. This will get changed by the templating system when creating new game projects.
 
 5. Copy your game template to the `templates/<engine>` directory of RapidGame. On Mac / Linux this is `/usr/local/lib/node_modules/rapidgame`. You can use the `npm prefix -g` command to determine where Node modules are installed on your system. If you're on Mac OS X, the template is for Unity and it is called "ZombieMatrix" then the final directory would be `/usr/local/lib/node_modules/rapidgame/templates/unity/ZombieMatrix/`.

 6. Your template is now ready for testing. Try it out like this: `rapidgame create <engine> MyNewGame com.mycompany.mynewgame -t "ZombieMatrix" `.


Contributing
------------

Submit pull requests or open issues as you see fit.


License
-------

RapidGame is licensed under the MIT license.


