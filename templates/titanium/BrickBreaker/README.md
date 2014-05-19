The game contained in this directory can be immediately used **as is**. It's a fully functional Breakout clone and does not require any dependencies.


Create Your Own Game In 30 Seconds
----------------------------------

To quickly create your own Breakout clone for Titanium:

	sudo npm install rapidgame -g
	rapidgame MyGame -e titanium -t BrickBreaker -k com.mycompany.mygame

What the command does is to copy this game template directory, rename the project to your choice of title (`BrickBreaker` becomes `MyGame`), replace all instances of the package name with yours (`com.wizardfu.brickbreaker` becomes `com.mycompany.mygame`). At that point you can begin editing the game to your liking.


Background
----------

This game originally started as preparation for a blog post published on Binpress called [Selecting a Cross-platform Game Engine](http://www.binpress.com/blog/2014/05/14/selecting-cross-platform-game-engine/).

In order to accurately compare and contrast the game engines, I wrote a Breakout clone from scratch using each one. After completing the Breakout clones, I decided to release them on Github by re-purposing them slightly and making them [RapidGame](http://wizardfu.com/rapidgame) templates.


Why Use RapidGame?
------------------

You might be wondering why you should use RapidGame. Here's a few reasons:

 1. Save time by starting with a functional game. It takes a significant amount of development to create game and menu scenes, incorporate physics, load sprites, get the viewport settings correct, play sounds and music, etc. Save yourself the time by starting with something that already works. Just customize the graphics, sounds, Menu and Game scenes until you have the game you are imagining.
 
 2. Save time by using the template system. You don't have to hunt for all the instances of "BrickBreaker" and change them to "MyGame". You don't have to hunt for "com.wizardfu.brickbreaker" and rename it to "com.mycompany.mygame". The command does the grunt work for you.
 
 3. **Cocos2D-specific:** save time by using prebuilt static libraries. The Cocos2D JS game engine is 100% open-source. Compiling all those native source files can be a real pain. Especially when all one has to do is switch from the simulator to device to trigger a rebuild. RapidGame solves this by incorporating a command which automatically downloads the latest Cocos2D JS, patches it to ensure that it's bug-free, then prebuilds it for all possible platforms, configurations and architectures. It takes awhile but it's worth every second, as it virtually eliminates build / compile / link times during day-to-day development. Even better, RapidGame will absolutely symlink to the location of the prebuilt libraries so your game projects stay lightweight and can be moved easily.

 4. Compare cross-platform game engines. Have you ever wondered how a Unity, Corona, Cocos2D JS or Titanium game is structured? How do they stack up? How easy is it to incorporate physics? Because RapidGame implements the same game in multiple engines, one can evaluate for themselves the pros and cons of each.

 5. Save time by using your own game template. You can add your own game template to RapidGame. The best part is that it's smart enough to do the grunt work of renaming automatically. See the [RapidGame readme](https://github.com/NatWeiss/RapidGame/blob/master/README.md) for more information.
 
