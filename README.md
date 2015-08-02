[![](https://raw.githubusercontent.com/NatWeiss/RapidGame/master/RapidGame.jpg)](http://youtu.be/SOJs2DwIxOU)

	__________              .__    .___________
	\______   \____  ______ |__| __| _/  _____/_____    _____   ____
	 |       _|__  \ \____ \|  |/ __ /   \  ___\__  \  /     \_/ __ \
	 |    |   \/ __ \|  |_> >  / /_/ \    \_\  \/ __ \|  Y Y  \  ___/
	 |____|_  (____  /   __/|__\____ |\______  (____  /__|_|  /\___  >
	        \/     \/|__|           \/       \/     \/      \/     \/

RapidGame is a commandline tool for Mac and Windows (Linux support is planned) which:

1. Prebuilds cocos2d-x libraries for Mac, iOS, Android and Windows for multiple architectures and configurations, virtually eliminating the need to ever rebuild cocos2d-x or its Javascript bindings.

2. A game project templating system for creating cross-platform games for a variety of game engines, including cocos2d-x, Unity, Corona and Appcelerator Titanium. The default game template creates a simple Breakout clone with a menu and game scene.

Prefer somebody explaining and showing it? Check out the [overview video](http://youtu.be/SOJs2DwIxOU).


Updates
-------

* August 2, 2015: Upgraded to cocos2d-x 3.7 (cocos2d-js and cocos2d-x have now been merged into just cocos2d-x).
* June 2, 2015: Can now prebuild Android on Windows thanks to [Samuel Ørsnæs](https://github.com/samoersnaes).
* May 4, 2015: Upgraded to cocos2d-x 3.6 / cocos2d-js 3.6.
* Mar 15, 2015: Fixed another bug related to MSBuild path on Windows (thanks, [Adam Yocum](https://github.com/adamyocum)). Fixed the cocos2d-x Android template.
* Feb 24, 2015: Now has separate cocos2d-x and cocos2d-js templates. Fixed a bug on Windows: "Unable to find MSBuild path." Still a few Windows-specific kinks to work out in the next version.
* Feb 19, 2015: Fixed a bug in Xcode projects (reference to script folder).
* Feb 7, 2015: Prebuilder updated for cocos2d-js 3.2 final / cocos2d-x 3.3.
* Dec 28, 2014: Prebuilder updated for cocos2d-js 3.2 rc0 / cocos2d-x 3.3.
* Aug 14, 2014: Prebuilder updated for cocos2d-js 3.0 rc2 / cocos2d-x 3.2.


Create a Game in Under 30 Seconds
---------------------------------

You'll first need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).

There's no need to clone this repo, just install RapidGame:

	sudo npm install rapidgame -g

Or, on Windows leave off the `sudo` and ensure that `git` is a part of your PATH:

	npm install rapidgame -g

And, create a cocos2d-x game named "HeckYeah" (run this as administrator on Windows):

	rapidgame create cocos2dx "HeckYeah" org.myorg.heckyeah

Or, a Unity game named "ZombieMatrix":

	rapidgame create unity "ZombieMatrix" com.mycompany.zombiematrix

For usage instructions:

	rapidgame --help

New to the cocos2d family of game engines? In general, cocos2d-x (`rapidgame create cocos2dx`) is C++ and cocos2d-js (`rapidgame create cocos2djs`) is Javascript.


Requirements
------------

Mac OS X: Xcode 5 or newer, [Git](http://git-scm.com/downloads) and [Node.js](http://nodejs.org/download/).

Windows: Visual Studio 2012 or newer (get it for free [here](https://www.visualstudio.com/en-us/products/free-developer-offers-vs.aspx)), [Git](http://git-scm.com/downloads), and [Node.js](http://nodejs.org/download/). Read the [Windows Notes](#windows-notes) for additional notes you should be aware of.

Linux: support is planned.

Android: please read the [Android README](http://htmlpreview.github.io/?https://github.com/NatWeiss/RapidGame/blob/master/templates/cocos2dx/TwoScene/Projects/android/README.html) or [watch the video](https://www.youtube.com/watch?v=5PWEtjvhX1k) to find out what you will need for Android development.


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

The prebuilder automatically downloads cocos2d-x, patches it to ensure that it can be built from the commandline, then prebuilds cocos2d-x for all possible platforms, configurations and architectures. It is then possible to compile and link native cocos2d-x games in seconds. Even better, the project creator will absolutely symlink to the location of the prebuilt libraries so your game projects stay lightweight and can be moved easily. A regular cocos2d-x game project directory can be half a gigabyte or more. A RapidGame project is around two megabytes.


<!--

Build Status ![](https://img.shields.io/badge/version-0.9.9-blue.svg)
------------

Refer here to get an overview of what platforms you can and cannot build for based on the most recent release of RapidGame. As certain platforms (e.g. iOS and Android) can have devices with different CPU architectures on them, if there is a problem building for a particular architecture, it will be included as a separate table entry from the other architectures of that platform.

### Windows

|          | Win32 | Android | Android-x86 | HTML5 |
| -------- | :---: | :-----: | :---------: | :---: |
| cocos2d-x | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) | ![](https://img.shields.io/badge/build-failing-red.svg) | ![](https://img.shields.io/badge/build-skipped-yellowgreen.svg) |
| cocos2d-js | ![](https://img.shields.io/badge/build-failing-red.svg) | ![](https://img.shields.io/badge/build-failing-red.svg) | ![](https://img.shields.io/badge/build-failing-red.svg) | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) |

### Mac

|          | Mac | iOS | Android | Android-x86 | HTML5 |
| -------- | :-: | :-: | :-----: | :---------: | :---: |
| cocos2d-x | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) | ![](https://img.shields.io/badge/build-unknown-lightgrey.svg) | ![](https://img.shields.io/badge/build-skipped-yellowgreen.svg) |
| cocos2d-js | ![](https://img.shields.io/badge/build-unknown-lightgrey.svg) | ![](https://img.shields.io/badge/build-unknown-lightgrey.svg) | ![](https://img.shields.io/badge/build-unknown-lightgrey.svg) | ![](https://img.shields.io/badge/build-unknown-lightgrey.svg) | ![](https://img.shields.io/badge/build-passing-brightgreen.svg) |

-->


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


More About Prebuilding
----------------------

The command to prebuild cocos2d-x static libraries used by cocos2d-js on native platforms:

	rapidgame prebuild

When the command is finished, you'll have a directory (`~/Library/Developer/RapidGame` on Mac and `C:\Users\[USERNAME]\AppData\Roaming\npm\node_modules\rapidgame` on Windows) with include files, java files, make files, Javascript bindings and prebuilt library files for all currently available architectures, platforms and configurations.


Development Platforms
---------------------

RapidGame can be used on any platform that is capable of running Node.js.

The cocos2d-x library prebuilder currently works on the following development platforms:

* Mac
* Windows

Linux support is planned.


Android Notes
-------------

A detailed guide has been written specifically for how to build Android projects using RapidGame. You can read it [here](http://htmlpreview.github.io/?https://github.com/NatWeiss/RapidGame/blob/master/templates/cocos2dx/TwoScene/Projects/android/README.html), or alternatively find it in your cocos2d-x/js project as `[APPNAME]/Projects/android/README.html`.


Windows Notes
-------------

1. The `rapidgame create` command must be run in an admin console. This allows symlinks to be properly created, otherwise what should be symlinks will become regular folders and the command will fail.
2. To compile the Android libraries successfully, `rapidgame prebuild` must be run via [Cygwin](https://www.cygwin.com). Read about all the specific requirements in the [Android README](http://htmlpreview.github.io/?https://github.com/NatWeiss/RapidGame/blob/master/templates/cocos2dx/TwoScene/Projects/android/README.html), or [watch the video](https://www.youtube.com/watch?v=5PWEtjvhX1k) instead.
3. Windows cannot build the cocos2d-x libraries or cocos2d-js bindings for iOS and Mac. If you want to use RapidGame to develop for these platforms, you must use a Mac.

Thanks to [Samuel Ørsnæs](https://github.com/samoersnaes) for getting the Android build working in Windows!


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


