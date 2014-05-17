
RapidGame
=========

RapidGame is an SDK-agnostic, cross-platform game project creator, library prebuilder and collection of game templates.
Game templates, including a complete Breakout clone, are included for Cocos2D JS, Unity, Corona and Appcelerator Titanium.


Setup
-----

 1. Make sure you have installed [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).
 2. Install RapidGame: `sudo npm install rapidgame -g`
 3. Create a Cocos2D JS HelloWorld game project named MyGame: `rapidgame MyGame`
 4. Create a Unity Breakout clone named BrickMan: `rapidgame -e unity -t BrickBreaker BrickMan`
 5. For usage instructions: `rapidgame --help`


Prebuilding
-----------

The purpose of RapidGame is to make game development a more modern and swift process.
One of the ways it does this is by prebuild libraries.
If you've ever created a Cocos2D game project, you'll groan thinking about re-compiling 300+ source files repeatedly.

RapidGame has custom scripts and project files to automatically download the latest Cocos2D JS source code and build it statically for multiple platforms and architectures.
Instead of building 900 source files you'll have 4 or 5 to deal with at most.
Since you'll be developing with Javascript, most of the time all that has to be done is to copy the latest resouces (a Javascript file or two) and re-launch the simulator.

To prebuild Cocos2D JS libraries, run:

`rapidgame prebuild`

It will take awhile.
You can watch the progress with `tail -f <path-to-build.log>`.

When the command is finished, you'll have a directory with include files, java files, make files, Javascript bindings and prebuilt debug & release static libraries for iOS, Mac and Android.
When you create projects with the `rapidgame` tool, it symlinks to this directory, making game project directories lightweight.


Contributing
------------

I have much respect for contributors. :) Submit pull requests or open issues as you see fit.


License
-------

RapidGame is licensed under the MIT license.

