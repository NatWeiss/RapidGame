//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

var MenuScene = cc.Scene.extend({
	layer: null,
	
	onEnter: function() {
		this._super();
		this.layer = new MenuLayer();
		this.layer.init();
		this.addChild(this.layer);
	}
});

var MenuLayer = cc.Layer.extend({
	bg: null,
	bg2: null,
	logo: null,
	logoLabel: null,
	menu: null,
	playButton: null,
	exitButton: null,
	
	init: function() {
		var self = this,
			font = App.config["font"],
			logoText,
			x, y;

		this._super();

		// Determine state
		if (typeof App.score === "undefined") {
			logoText = "BrickBreaker";
			App.playEffect("res/Intro.mp3");
		} else if (App.lives === 0) {
			logoText = "Game Over";
			App.playEffect("res/Lose.mp3");
		} else {
			logoText = "You Won!";
			App.playEffect("res/Win.mp3");
		}

		// Stretched big background
		this.bg = cc.LayerColor.create(cc.color(208, 204, 202, 255));
		this.addChild(this.bg, -1);

		// Actual background
		this.bg = cc.LayerColor.create(cc.color(218, 214, 212, 255), App.contentWidth, App.contentHeight);
		this.bg.attr({x: App.contentX, y: App.contentY});
		this.addChild(this.bg, 0);
		
		// Logo
		y = 24;
		this.logo = cc.Sprite.create("Logo.png");
		this.logo.setPosition(App.centralize(0, 228));
		this.addChild(this.logo, 1);
		this.logo.y -= y * .5;
		this.logo.runAction(cc.RepeatForever.create(cc.Sequence.create(
			cc.EaseInOut.create(cc.MoveBy.create(2, cc.p(0, y)), 1.2),
			cc.EaseInOut.create(cc.MoveBy.create(2, cc.p(0, -y)), 1.2)
		)));

		// Title
		this.logoLabel = cc.LabelTTF.create(
			App.getLocalizedString("title"),
			font,
			200
		);
		this.logoLabel.setColor(cc.color(128, 128, 128));
		this.logoLabel.setPosition(App.centralize(0, 228));
		this.addChild(this.logoLabel, 1);

		// Menu
		this.menu = cc.Menu.create();
		this.menu.setPosition(cc.p());
		this.addChild(this.menu, 1);

		// Buttons
		this.playLabel = cc.MenuItemFont.create("Play", this.onPlayButton, this);
		this.playLabel.setPosition(App.centralize(-300, -400));
		this.playLabel.setFontSize(120);
		this.playLabel.setFontName(font);
		this.playLabel.setColor(cc.color(196, 196, 196));
		this.menu.addChild(this.playLabel);

		this.exitLabel = cc.MenuItemFont.create("Exit", this.onExitButton, this);
		this.exitLabel.setPosition(App.centralize(300, -400));
		this.exitLabel.setFontSize(120);
		this.exitLabel.setFontName(font);
		this.exitLabel.setColor(cc.color(196, 196, 196));
		this.menu.addChild(this.exitLabel);
		
		return true;
	},
	
	onPlayButton: function() {
		var scene = new GameScene;
		scene.init();
		cc.director.runScene(scene);
	},
	
	onExitButton: function() {
		cc.log("Pressed exit button");
	}

});

