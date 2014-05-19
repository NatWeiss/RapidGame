
RapidGame
=========

RapidGame is a cross-platform game templating system for Cocos2D JS, Unity, Corona and Appcelerator Titanium.
It can currently output Hello World or a Breakout Clone in your choice of engine.

The primary goal of RapidGame is to make game development more rapid.
The templating system is part of that.
With Cocos2D JS it further helps by prebuilding Cocos2D X libraries statically, which virtually eliminates build / compile / link time.


Prerequisites
-------------

You'll need [Node.js](http://nodejs.org/download/) and [Git](http://git-scm.com/downloads).


Create a Game in Under 30 Seconds
---------------------------------

Install RapidGame:

	sudo npm install rapidgame -g

Create a Unity Breakout clone named BrickMan

	rapidgame -e unity -t BrickBreaker BrickMan


Run
---

To run your Unity game just open the project in [Unity](https://unity3d.com/unity/download) and click the triangular Play button. (The Breakout clone currently plays using the arrow keys to move the paddle and spacebar to launch the ball.)

To run your Corona game just open the Corona Simulator and open your `main.lua` file.

To run your Cocos2D JS game in a browser just launch the server `cd MyGame && ./run-server` and visit `[localhost:8000](http://localhost:8000)`.

To run your Cocos2D JS game natively for iOS or Mac, just open `proj.ios_mac/MyGame.xcodeproj` and Run. Note that you will need to have completed the `rapidgame prebuild` command so that Cocos2D X static libraries can be linked against.

To run your Cocos2D JS game for Android: `cd MyGame/proj.android && make && make run`. This also requires Cocos2D X static libraries, so make sure to `rapidgame prebuild`.


More About Prebuilding
----------------------

The command to prebuild Cocos2D X static libraries used by Cocos2D JS on native platforms:

	rapidgame prebuild

It takes awhile but it's worth every second.

When the command is finished, you'll have a directory (`~/Library/Developer/RapidGame` on Macs) with include files, java files, make files, Javascript bindings and prebuilt static libraries for iOS, Mac and Android in Debug and Release mode for all available architectures.
When you create Cocos2D JS projects with the `rapidgame` tool, it symlinks to this directory, making game project directories lightweight.


Pro Version
-----------

If you need cross-platform monetization, in-app purchasing, virtual economies, social networking, async multiplayer, analytics and/or ads, check out [RapidGame Pro](http://www.binpress.com/app/rapidgame-pro-for-ios-android-facebook/1802). It has an example game called Lemonade Exchange written using the Cocos2D JS engine which includes all of the previously mentioned features and works on Facebook, iOS, Mac and Android. More platforms are planned.


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

