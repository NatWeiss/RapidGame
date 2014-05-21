//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var platino = require("co.lanica.platino");

var MenuScene = function(window, game) {
	var fontName = "Dolce Vita";
	
	var screenWidth = 0;
	var screenHeight = 0;
	var middle = {};
	var scene = platino.createScene();
	var bg = null;
	var bg2 = null;
	var logo = null;
	var transform = null;
	var labelTransform = null;
	var logoLabel = null;
	var playLabel = null;
	var introSound = Ti.Media.createSound({url:"Intro.mp3"});
	
	var onSceneActivated = function(e) {
		var size,logoText;
		Ti.API.info("MenuScene has been activated.");
		screenWidth = game.TARGET_SCREEN.width;
		screenHeight = game.TARGET_SCREEN.height;
		middle.x = game.STAGE_START.x + (screenWidth * 0.5);
		middle.y = game.STAGE_START.y + (screenHeight * 0.5);

		// Determine state
		logoText = "TwoScene";
		introSound.play();

		// Setup background
		bg2 = platino.createSprite({
			width: screenWidth * 2,
			height: screenHeight * 2
		});
		bg2.color(208/255, 204/255, 202/255);
		bg2.center = {x: middle.x, y: middle.y};
		scene.add(bg2);

		bg = platino.createSprite({
			width: screenWidth,
			height: screenHeight
		});
		bg.color(218/255, 214/255, 212/255);
		bg.center = {x: middle.x, y: middle.y};
		scene.add(bg);

		// Logo
		logo = platino.createSprite({image: "Logo.png"});
		logo.anchorPoint = {x: 0.5, y: 0.5};
		logo.center = {
			x: middle.x,
			y: middle.y - 200,
		};
		scene.add(logo);

		// Logo label
		logoLabel = platino.createTextSprite({
			text: logoText,
			fontSize: 220,
			fontFamily: "Dolce Vita",
			alpha: 0.5
		});
		size = logoLabel.sizeWithText(logoLabel.text);
		logoLabel.center = {x: logo.center.x - size.width * .5, y: logo.center.y - size.height * .5};
		scene.add(logoLabel);

		// Logo tween
		var tweenY = 25;
		logo.y -= tweenY * .5;
		transform = platino.createTransform({
			duration: 2000,
			y: logo.y + tweenY,
			autoreverse: true,
			repeat: -1,
			easing: platino.ANIMATION_CURVE_EASE_IN_OUT
		});
		logo.transform(transform);

		// Play label
		var xOffset = 0;
		var yOffset = 400;
		playLabel = platino.createTextSprite({
			text: "Play",
			fontSize: 120,
			fontFamily: "Dolce Vita",
			alpha: 0.333
		});
		size = playLabel.sizeWithText(playLabel.text);
		playLabel.center = {x: middle.x - size.width * .5 - xOffset, y: middle.y - size.height * .5 + yOffset};
		scene.add(playLabel);

		game.addEventListener('enterframe', scene.update);
		game.addEventListener('touchstart', scene.onTouch);
		game.addEventListener('touchmove', scene.onTouch);
		game.addEventListener('touchend', scene.onTouch);
		game.addEventListener('touchcancel', scene.onTouch);
	};

	scene.update = function(event) {
		// event.delta is milliseconds, event.uptime is seconds
		var delta = event.delta / 1000;
	};
	
	scene.onTouch = function(event) {
		if (event.type !== "touchend") {
			return;
		}
		var touchX = event.x * game.touchScaleX;
		var touchY = event.y * game.touchScaleY;
		
		if (playLabel.contains(touchX, touchY)) {
			playLabel.color(1, 0, 0);
			labelTransform = platino.createTransform({
				duration: 200,
				scaleX: 1.2,
				scaleY: 1.2,
				autoreverse: true,
				easing: platino.ANIMATION_CURVE_EASE_IN_OUT
			});
			playLabel.transform(labelTransform);
			setTimeout(endScene, 400);
		}
	};
	
	var removeListeners = function(){
		game.removeEventListener('enterframe', scene.update);
		game.removeEventListener('touchstart', scene.onTouch);
		game.removeEventListener('touchmove', scene.onTouch);
		game.removeEventListener('touchend', scene.onTouch);
		game.removeEventListener('touchcancel', scene.onTouch);
	};
	
	var endScene = function() {
		Ti.API.info("Going to game scene");
		var GameScene = require("GameScene");
		var s = new GameScene(window, game);
		game.replaceScene(s);
		game.startCurrentScene();
		removeListeners();
	};
	
	var remove = function(sprite) {
		if (sprite) {
			scene.remove(sprite);
			sprite.dispose();
		}
	};
	
	var onSceneDeactivated = function(e) {
		remove(bg); bg = null;
		remove(bg2); bg2 = null;
		remove(logo); logo = null;
		remove(logoLabel); logoLabel = null;
		remove(playLabel); playLabel = null;

		scene.dispose();
		scene = null;

		var mem = Ti.Platform.availableMemory;
		mem = parseFloat(Ti.Platform.osname === "android" ? mem/1024 : mem).toFixed(2);
		Ti.API.info("MenuScene deactivated. Available memory " + mem + " MB.");
	};

	// called when user presses the Android hardware back button
	// when this scene is the current scene
	scene.backButtonHandler = function() {

	};
	
	scene.addEventListener('activated', onSceneActivated);
	scene.addEventListener('deactivated', onSceneDeactivated);
	return scene;
};

module.exports = MenuScene;
