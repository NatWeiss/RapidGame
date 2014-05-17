//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// ### SceneHello
//
// The template project's primary scene. It displays "Hello World" and the result of the server's `api/counter` call. Repeating animations make it juicy. Clicking or tapping the screen plays a sound and also plays a droplet-like animation.
//
// A sub-class of `cc.Scene`.
//
var SceneHello = cc.Scene.extend({
	layer: null,
	
//
// ###  SceneHello.onEnter
//
// Create the child layer and keep it as a member variable so `onXXX` callbacks can be triggered via `App.callRunningLayer`.
//
	onEnter: function() {
		this._super();
		this.layer = new LayerHello();
		this.layer.init();
		this.addChild(this.layer);
	}
});

//
// ###  LayerHello
//
// The layer which holds all the Hello World objects and responds to events or callbacks.
//
var LayerHello = cc.Layer.extend({
	bg: null,
	labelHello: null,
	labelCounter: null,

//
// ###   LayerHello.init
//
// Create the text labels and background layer. Start repeating animations. Register for events.
//
	init: function() {
		var self = this,
			font = App.config["font"];
		this._super();

		/* Create background. */
		this.bg = cc.LayerGradient.create(
			cc.color(127,190,255,255),
			cc.color(102,153,204,255),
			cc.p(0.25,-1)
		);
		this.bg.setAnchorPoint(0, 0);
		this.addChild(this.bg, 0);
		
		/* Create Hello World label. */
		labelHello = cc.LabelTTF.create(
			App.getLocalizedString("hello-world"),
			font,
			App.scale(120)
		);
		labelHello.setPosition(App.centralize(0, 114));
		this.addChild(labelHello, 1);
		labelHello.y += App.winSize.height;
		labelHello.runAction(
			cc.EaseOut.create(cc.MoveBy.create(0.333, cc.p(0, -App.winSize.height)), 1.1)
		);
		labelHello.runAction(cc.RepeatForever.create(cc.Sequence.create(
			cc.EaseOut.create(cc.ScaleBy.create(1.0, 0.95), 1.5),
			cc.EaseOut.create(cc.ScaleBy.create(3.0, 1.0 / 0.95), 1.5)
		)));

		/* Create counter number label. */
		this.labelCounter = cc.LabelTTF.create("", font, App.scale(75));
		this.labelCounter.setPosition(App.centralize(0, -50));
		this.addChild(this.labelCounter, 1);
		this.labelCounter.x += App.winSize.width;
		this.labelCounter.runAction(cc.Sequence.create(
			cc.DelayTime.create(0.25),
			cc.EaseOut.create(cc.MoveBy.create(0.333, cc.p(-App.winSize.width, 0)), 1.1),
			cc.EaseOut.create(cc.ScaleBy.create(0.1, 1.1), 2.0),
			cc.EaseOut.create(cc.ScaleBy.create(0.2, 1 / 1.1), 1.5)
		));

		/* Handle touch events. */
		cc.eventManager.addListener({
			event: cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesBegan: function(touches, event) {
				if (touches) {
					App.showTouchCircle(self, touches[0].getLocation());
					App.playClickSound();
				}
			}
		}, this);

		return true;
	},
	
//
// ###  LayerHello.setCounterLabel
//
// Set the counter label's string given a counter value.
//
	setCounterLabel: function(number) {
		var string = App.getLocalizedString("you-are-player-number");
		string = string.replace("%d", number);
		this.labelCounter.setString(string);
	},

//
// ###  LayerHello.onEnter
//
// Set the counter label to 1 and request the current counter from the server.
//
	onEnter: function() {
		this._super();
		this.setCounterLabel("1");
		App.requestUrl("api/counter", this.onGetCounter);
	},
	
//
// ###  LayerHello.onGetCounter
//
// Called when the counter label is retrieved from the server. It doesn't have `this` context so it gets the running layer.
//
	onGetCounter: function(response) {
		var self = App.getRunningLayer();
		self.setCounterLabel(parseInt(response));
	}

});

