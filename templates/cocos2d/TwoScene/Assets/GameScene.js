//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var GameScene = cc.Scene.extend({
	layer: null,
	
	onEnter: function() {
		this._super();
		this.layer = new GameLayer();
		this.layer.init();
		this.addChild(this.layer);
	}
});

var GameLayer = cc.Layer.extend({
	collisionTypeBall: 1,
	collisionTypeWall: 2,
	ballSpeed: 1500,
	gravity: -2500,
	labelPadding: 60,
	wallThickness: 40,
	bg: null,
	bg2: null,
	ball: null,
	scoreLabel: null,
	sceneLabel: null,
	x1: 0,
	x2: 0,
	y1: 1,
	y2: 1,
	walls: [],

	init: function() {
		var self = this, i, x, y, w, h;
		this._super();
		
		Game.score = 0;

		this.x1 = Game.contentX + this.wallThickness;
		this.x2 = this.x1 + Game.contentWidth - this.wallThickness * 2;
		this.y1 = Game.contentY + this.wallThickness;
		this.y2 = this.y1 + Game.contentHeight - this.wallThickness * 2;

		// Stretched big background
		this.bg2 = cc.LayerColor.create(cc.color(208, 204, 202, 255));
		this.bg2.scale = 2;
		this.addChild(this.bg2, -1);

		// Actual background
		this.bg = cc.LayerColor.create(cc.color(218, 214, 212, 255), Game.contentWidth, Game.contentHeight);
		this.bg.attr({x: Game.contentX, y: Game.contentY});
		this.addChild(this.bg, 0);
		
		// Labels
		this.scoreLabel = cc.LabelTTF.create("Score: " + Game.score.toString(), Game.config["font"], 45);
		this.scoreLabel.setAnchorPoint(0, 1);
		this.scoreLabel.setPosition(this.x1 + this.labelPadding, this.y2 - this.labelPadding);
		this.scoreLabel.setColor(cc.color(128, 128, 128));
		this.addChild(this.scoreLabel, 1);

		this.sceneLabel = cc.LabelTTF.create(
			"Game Scene",
			Game.config["font"],
			200
		);
		this.sceneLabel.setColor(cc.color(128, 128, 128));
		this.sceneLabel.setPosition(Game.centralize(0, 228));
		this.addChild(this.sceneLabel, 1);
		this.sceneLabel.runAction(cc.Sequence.create(
			cc.FadeOut.create(5),
			cc.RemoveSelf.create()
		));

		if (Game.config.playMusic) {
			Game.playMusic("Song.mp3");
		}
		
		// Start physics
		Game.startPhysics(cc.p(0, this.gravity));
		
		// Walls
		walls = [
			Game.createPhysicsBox(this.x1, this.y1, this.x2, Game.contentY, 0.9, 0, this.collisionTypeWall), // bottom
			Game.createPhysicsBox(this.x1, this.y2, this.x2, this.y2 + this.wallThickness, 0.9, 0, this.collisionTypeWall), // top
			Game.createPhysicsBox(Game.contentX, Game.contentY, this.x1, this.y2 + this.wallThickness, 0.9, 0, this.collisionTypeWall), // left
			Game.createPhysicsBox(this.x2, Game.contentY, this.x2 + this.wallThickness, this.y2 + this.wallThickness, 0.9, 0, this.collisionTypeWall) // right
		];
	
		// Ball
		this.ball = Game.createPhysicsSprite("Ball.png", 1, 0, true, this.collisionTypeBall);
		this.ball.body.setPos(cp.v(Game.winSize.width * .5, Game.winSize.height * .5));
		this.addChild(this.ball, 1);
		
		// Handle collision events
		Game.space.addCollisionHandler(this.collisionTypeBall, this.collisionTypeWall, null, null, null, function(arbiter, space){
			Game.score += 10;
			self.scoreLabel.setString("Score: " + Game.score);
			Game.playEffect("Wall.mp3");
		});
		
		// Handle touch events
		Game.addTouchListeners(this, this.touchHandler);
		
		// World update
		this.scheduleUpdate();

		return true;
	},
	
	update: function(delta) {
		Game.stepPhysics(delta);
		
		// Move ball sprite with body
		if (this.ball) {
			var v = this.ball.body.getPos();
			v = cp.v(v.x, v.y);
			this.ball.setPosition(v);
		}
	},
	
	onExit: function() {
		this.unscheduleUpdate();
		Game.space.removeCollisionHandler(Game.space, this.collisionTypeBall, this.collisionTypeWall);
	},

	touchHandler: function(type, touches, event) {
		var self = Game.getRunningLayer();
		if (type === "began") {
			Game.playEffect("Intro.mp3");
			self.ball.body.setVel(cp.v(
				touches[0].getLocation().x < Game.winSize.width * .5 ? -self.ballSpeed : self.ballSpeed,
				self.ballSpeed
			));
		}
	}

});
