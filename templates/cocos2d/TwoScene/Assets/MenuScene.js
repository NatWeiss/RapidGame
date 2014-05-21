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
			font = Game.config["font"],
			logoText,
			x, y;

		this._super();

		logoText = "TwoScene";
		Game.playEffect("Intro.mp3");

		// Background
		this.bg = cc.LayerColor.create(cc.color(218, 214, 212, 255));
		this.addChild(this.bg, -1);
		
		// Logo
		y = 24;
		this.logo = cc.Sprite.create("Logo.png");
		this.logo.setPosition(Game.centralize(0, 228));
		this.addChild(this.logo, 1);
		this.logo.y -= y * .5;
		this.logo.runAction(cc.RepeatForever.create(cc.Sequence.create(
			cc.EaseInOut.create(cc.MoveBy.create(2, cc.p(0, y)), 1.2),
			cc.EaseInOut.create(cc.MoveBy.create(2, cc.p(0, -y)), 1.2)
		)));

		// Title
		this.logoLabel = cc.LabelTTF.create(
			Game.getLocalizedString("title"),
			font,
			200
		);
		this.logoLabel.setColor(cc.color(128, 128, 128));
		this.logoLabel.setPosition(Game.centralize(0, 228));
		this.addChild(this.logoLabel, 1);

		// Menu
		this.menu = cc.Menu.create();
		this.menu.setPosition(cc.p());
		this.addChild(this.menu, 1);

		// Buttons
		this.playLabel = cc.MenuItemFont.create("Play", this.onPlayButton, this);
		this.playLabel.setPosition(Game.centralize(0, -400));
		this.playLabel.setFontSize(120);
		this.playLabel.setFontName(font);
		this.playLabel.setColor(cc.color(196, 196, 196));
		this.menu.addChild(this.playLabel);
		
		return true;
	},
	
	onPlayButton: function() {
		var scene = new GameScene;
		scene.init();
		cc.director.runScene(scene);
	}

});

