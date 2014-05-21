//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var platino = require("co.lanica.platino");

var GameScene = function(window, game) {
	var playMusic = true;
	var ballSpeed = 1500;
	var wallThickness = 40;
	var fontName = "Dolce Vita";
	var ballVelocity = {x: 0, y: 0};
	var gravity = -1250;
	var wallBounce = 0.75;
	
	var screenWidth = 0;
	var screenHeight = 0;
	var middle = {};
	var bounds = {};
	var scene = platino.createScene();
	var bg = null;
	var bg2 = null;
	var ball = null;
	var transforms = [];
	var scoreLabel = null;
	var music = Ti.Media.createSound({url:"Song.mp3"});
	var wallSound = Ti.Media.createSound({url:"Wall.mp3"});
	var jumpSound = Ti.Media.createSound({url:"Intro.mp3"});
	
	var clamped = function(value, lowest, highest){
		return Math.max(lowest, Math.min(highest, value));		
	};
	
	var rand = function(min, max){
		return Math.floor(Math.random() * (max - min)) + min;
	};

	// scene 'activated' event listener function (scene entry-point)
	var onSceneActivated = function(e) {
		Ti.API.info("GameScene has been activated.");
		screenWidth = game.TARGET_SCREEN.width;
		screenHeight = game.TARGET_SCREEN.height;
		middle.x = game.STAGE_START.x + (screenWidth * 0.5);
		middle.y = game.STAGE_START.y + (screenHeight * 0.5);
		bounds.x1 = game.STAGE_START.x + wallThickness;
		bounds.y1 = game.STAGE_START.y + wallThickness;
		bounds.x2 = bounds.x1 + screenWidth - wallThickness * 2;
		bounds.y2 = bounds.y1 + screenHeight - wallThickness * 2;
		game.score = 0;

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

		// Ball
		ball = platino.createSprite({image: "Ball.png"});
		ball.anchorPoint = {x: 0.5, y: 0.5};
		ball.center = {
			x: middle.x,
			y: middle.y,
		};
		scene.add(ball);
		
		// Labels
		scoreLabel = platino.createTextSprite({
			text: "Score: " + game.score,
			fontSize: 36,
			fontFamily: "Dolce Vita",
			alpha: 0.5,
			width: 300,
			height: 100,
			x: bounds.x1,
			y: bounds.y1 + 10
		});
		scene.add(scoreLabel);
		
		// Play music
		if (playMusic) {
			music.looping = true;
			music.play();
		}
		
		game.addEventListener('enterframe', scene.update);
		game.addEventListener('touchstart', scene.onTouch);
		game.addEventListener('touchmove', scene.onTouch);
		game.addEventListener('touchend', scene.onTouch);
		game.addEventListener('touchcancel', scene.onTouch);
	};

	// main update loop
	scene.update = function(event) {
		//Ti.API.info("Update " + event.delta + " " + event.uptime);
		// event.delta is milliseconds, event.uptime is seconds
		var delta = event.delta / 1000;
		
		// Move ball
		ball.x += delta * ballVelocity.x;
		ball.y += delta * ballVelocity.y;
		ballVelocity.y -= delta * gravity;
		
		// Bounce off edges
		var didBounce = false;
		if (ball.y < bounds.y1) {
			ball.y = bounds.y1 + (bounds.y1 - ball.y);
			ballVelocity.y = -ballVelocity.y * wallBounce;
			didBounce = true;
		}
		if (ball.y > bounds.y2) {
			ball.y = bounds.y2 + - ball.height;
			ballVelocity.y = -ballVelocity.y * wallBounce;
			didBounce = true;
		}
		if (ball.x < bounds.x1) {
			ball.x = bounds.x1 + (bounds.x1 - ball.x);
			ballVelocity.x = -ballVelocity.x * wallBounce;
			didBounce = true;
		}
		if (ball.x + ball.width > bounds.x2) {
			ball.x = bounds.x2 + - ball.width;
			ballVelocity.x = -ballVelocity.x * wallBounce;
			didBounce = true;
		}
		if (didBounce) {
			game.score += 10;
			scoreLabel.text = "Score: " + parseInt(game.score);
			wallSound.play();
		}
	};
	
	scene.onTouch = function(event) {
		//Ti.API.info("Touch " + JSON.stringify(event));
		
		// Launch ball
		ballVelocity.x = (event.x * game.touchScaleX < screenWidth * .5 ? -1 : 1) * ballSpeed;
		ballVelocity.y = -ballSpeed; 
		jumpSound.play();
	};

	var endScene = function(){
		Ti.API.info("Going to menu scene");
		var MenuScene = require("MenuScene");
		var s = new MenuScene(window, game);
		game.replaceScene(s);
		game.startCurrentScene();
		game.removeEventListener('enterframe', scene.update);
		game.removeEventListener('touchstart', scene.onTouch);
		game.removeEventListener('touchmove', scene.onTouch);
		game.removeEventListener('touchend', scene.onTouch);
		game.removeEventListener('touchcancel', scene.onTouch);
	};

	var remove = function(sprite) {
		if (sprite) {
			scene.remove(sprite);
			sprite.dispose();
		}
	};
	
	var onSceneDeactivated = function(e) {
		var i,len;
		
		remove(bg); bg = null;
		remove(bg2); bg2 = null;
		remove(ball); ball = null;
		remove(scoreLabel); scoreLabel = null;

		scene.dispose();
		scene = null;

		var mem = Ti.Platform.availableMemory;
		mem = parseFloat(Ti.Platform.osname === "android" ? mem/1024 : mem).toFixed(2);
		Ti.API.info("GameScene deactivated. Available memory " + mem + " MB.");
	};
	
	scene.addEventListener('activated', onSceneActivated);
	scene.addEventListener('deactivated', onSceneDeactivated);
	return scene;
};

module.exports = GameScene;
