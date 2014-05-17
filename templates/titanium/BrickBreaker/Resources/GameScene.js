//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var platino = require("co.lanica.platino");

var GameScene = function(window, game) {
	var playMusic = true;
	var ballSpeed = 1500;
	var maxBallAngle = 75;
	var paddleSpeed = 1500;
	var minPaddleMovement = 25;
	var wallThickness = 40;
	var brickPadding = 16;
	var numOfRows = 4;
	var numOfCols = 11;
	var fontName = "Dolce Vita";
	var ballVelocity = {x: 0, y: 0};
	
	var screenWidth = 0;
	var screenHeight = 0;
	var isHeld = false;
	var touchX = 0;
	var middle = {};
	var bounds = {};
	var scene = platino.createScene();
	var bg = null;
	var bg2 = null;
	var paddle = null;
	var ball = null;
	var bricks = [];
	var brickCount = 0;
	var transforms = [];
	var scoreLabel = null;
	var livesLabel = null;
	var music = Ti.Media.createSound({url:"Song.mp3"});
	var paddleSound = Ti.Media.createSound({url:"Paddle.mp3"});
	var brickSound = Ti.Media.createSound({url:"Brick.mp3"});
	var wallSound = Ti.Media.createSound({url:"Wall.mp3"});
	var dieSound = Ti.Media.createSound({url:"Die.mp3"});
	
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
		bounds.y2 = bounds.y1 + screenHeight - wallThickness;
		game.score = 0;
		game.lives = 3;

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

		// Paddle
		paddle = platino.createSprite({image: "Paddle.png"});
		paddle.anchorPoint = {x: 0.5, y: 0.5};
		paddle.center = {
			x: middle.x,
			y: screenHeight - 100,
		};
		scene.add(paddle);

		// Ball
		ball = platino.createSprite({image: "Ball.png"});
		ball.anchorPoint = {x: 0.5, y: 0.5};
		ball.center = {
			x: middle.x,
			y: screenHeight - 90,
		};
		scene.add(ball);
		
		// Bricks
		var x,y,brick,top,left,w,h;
		brick = platino.createSprite({image: "Brick.png"});
		w = brick.width + brickPadding;
		h = brick.height + brickPadding;
		brick.dispose();
		brick = null;
		top = middle.y - (numOfRows * .5 * h);
		left = middle.x - (numOfCols * .5 * w);
		
		brickCount = 0;
		for (y = 0; y < numOfRows; y++) {
			for (x = 0; x < numOfCols; x++) {
				brick = platino.createSprite({image: "Brick.png"});
				brick.center = {
					x: left + (x + .5) * w,
					y: top + (y + .5) * h,
				};
				brick.anchorPoint = {x: 0.5, y: 0.5};
				scene.add(brick);
				bricks.push(brick);
				brickCount++;
			}
		}
		
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

		livesLabel = platino.createTextSprite({
			text: "Lives: " + game.lives,
			fontSize: 36,
			fontFamily: "Dolce Vita",
			alpha: 0.5,
			width: 300,
			height: 100,
			x: bounds.x2 - 120,
			y: bounds.y1 + 10
		});
		scene.add(livesLabel);
		
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
		
		// Move paddle
		if (isHeld && paddle !== null) {
			var direction = 1;
			if (Math.abs(touchX - paddle.center.x) < minPaddleMovement) {
				direction = 0;
			} else if (touchX < paddle.center.x) {
				direction = -1;
			}
			paddle.x += (direction * delta * paddleSpeed);
			paddle.x = clamped(paddle.x, bounds.x1, bounds.x2 - paddle.width);
		}

		// Move ball with paddle
		if (!ballVelocity.x && !ballVelocity.y) {
			ball.x = paddle.x + paddle.width * .5 - ball.width * .5;
			ball.y = paddle.y - paddle.height * .5 - ball.height;
			return;
		}
		
		// Move ball
		ball.x += delta * ballVelocity.x;
		ball.y += delta * ballVelocity.y;
		
		// Bounce off paddle
		if (ball.collidesWith(paddle)) {
			paddleSound.stop();
			paddleSound.play();
			
			var angle = ball.x + (ball.width * .5) - (paddle.x + (paddle.width * .5));
			angle /= paddle.width;
			angle *= 180;
			angle = clamped(angle, -maxBallAngle, maxBallAngle);
			//Ti.API.info("Angle " + angle);
			angle *= Math.PI / 180;
			
			// Compute new ball velocity based on angle
			ballVelocity.x = Math.sin(angle) * ballSpeed;
			ballVelocity.y = -Math.abs(Math.cos(angle) * ballSpeed);

			// Ensure ball is no longer in collision with paddle
			ball.y = paddle.y - paddle.height * .5 - ball.height;
		}
		
		// Bounce off edges
		if (ball.y < bounds.y1) {
			ball.y = bounds.y1 + (bounds.y1 - ball.y);
			ballVelocity.y = -ballVelocity.y;
			wallSound.play();
		} else if (ball.y > bounds.y2) {
			game.lives--;
			livesLabel.text = "Lives: " + parseInt(game.lives);
			if (game.lives <= 0) {
				endScene();
				return;
			}
			dieSound.play();
			ballVelocity.x = 0;
			ballVelocity.y = 0;
		} else if (ball.x < bounds.x1) {
			ball.x = bounds.x1 + (bounds.x1 - ball.x);
			ballVelocity.x = -ballVelocity.x;
			wallSound.play();
		} else if (ball.x + ball.width > bounds.x2) {
			ball.x = bounds.x2 + (bounds.x2 - ball.x) - ball.width;
			ballVelocity.x = -ballVelocity.x;
			wallSound.play();
		}
		
		// Destroy bricks
		var i,len = bricks.length,xOverlap,yOverlap;
		for (i = 0; i < len; i++) {
			if (bricks[i] !== null && ball.collidesWith(bricks[i])) {
				xOverlap = 0;
				yOverlap = 0;
				if (ball.x >= bricks[i].x && ball.x <= bricks[i].x + bricks[i].width) {
					xOverlap = (ball.x + ball.width * .5 - bricks[i].center.x) / bricks[i].width;
				}
				if (ball.y >= bricks[i].y && ball.y <= bricks[i].y + bricks[i].height) {
					yOverlap = (ball.y + ball.height * .5 - bricks[i].center.y) / bricks[i].height;
				}
				Ti.API.info("Ball " + parseInt(ball.x) + "," + parseInt(ball.y) +
					", Brick " + parseInt(bricks[i].x) + "," + parseInt(bricks[i].y) +
					", Overlap " + xOverlap + "," + yOverlap);
				
				//if (xOverlap || yOverlap) {
					if (xOverlap > yOverlap) {
						ballVelocity.x = -ballVelocity.x;
					} else {
						ballVelocity.y = -ballVelocity.y;
					}
				//}
				
				scene.createBrickExplosion(bricks[i].center.x, bricks[i].center.y);
				brickSound.play();
				bricks[i].hide();
				bricks[i].dispose();
				bricks[i] = null;
				//delete bricks[i];
				
				game.score += 10;
				scoreLabel.text = "Score: " + parseInt(game.score);
				brickCount--;
				if (brickCount <= 0) {
					// Win. Load menu scene
					endScene();
				}
				break;
			}
		}
	};
	
	scene.onTouch = function(event) {
		touchX = event.x * game.touchScaleX;
		isHeld = (event.type !== "touchend" && event.type !== "touchcancel");
		//Ti.API.info("Touch " + JSON.stringify(event));
		//Ti.API.info("Touch isHeld " + isHeld + ", x " + touchX);
		
		// Launch ball 
		if (!isHeld && !ballVelocity.x && !ballVelocity.y && ball.y < bounds.y2) {
			ballVelocity.y = -ballSpeed;
		}
	};
	
	scene.createBrickExplosion = function(x, y) {
		var i,
			count = 15,
			xRange = 400,
			yRange = 100,
			xMin = x-xRange,
			xMax = x+xRange,
			yMin = y-yRange,
			yMax = y+yRange,
			transform;
		
		for (i = 0; i < count; i++) {
			transform = platino.createTransform({
				duration: rand(250, 500),
				x: rand(xMin, xMax),
				y: rand(yMin, yMax),
				scaleX: 0.3,
				scaleY: 0.3,
				alpha: 0
			});
			transform.sprite = platino.createSprite({image: "Particle.png"});
			transform.sprite.anchorPoint = {x: 0.5, y: 0.5};
			transform.sprite.x = x;
			transform.sprite.y = y;
			scene.add(transform.sprite);
			transform.addEventListener("complete", function(e){
				e.source.sprite.hide();
				e.source.sprite.dispose();
				e.source.sprite = null;
			});
			transform.sprite.transform(transform);
			transforms.push(transform);
		}
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
		brickSound.stop();
		dieSound.stop();
		
		remove(bg); bg = null;
		remove(bg2); bg2 = null;
		remove(paddle); paddle = null;
		remove(ball); ball = null;
		len = bricks.length;
		for (i = 0; i < len; i += 1) {
			remove(bricks[i]); bricks[i] = null;
		}
		remove(scoreLabel); scoreLabel = null;
		remove(livesLabel); livesLabel = null;

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
