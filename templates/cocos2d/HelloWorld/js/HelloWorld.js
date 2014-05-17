//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// Extend the [App](App.html) object with project-specific functions.
//

//
// ###  App
//
// Get or create the App object.
//
var App = App || {};

//
// ###  App.playClickSound
//
// Play one of the click sounds in sequential order.
//
App.playClickSound = function() {
	var sounds = App.config["click-sounds"];
	this.clickSound = this.clickSound || 0;
	
	App.playEffect(sounds[this.clickSound]);
	
	this.clickSound = (this.clickSound + 1) % sounds.length;
};

//
// ###  App.showTouchCircle
//
// Show an expanding, fading circle at the given position or the given item's position.
//
App.showTouchCircle = function(parentNode, pos, item) {
	var circle;
	
	if (typeof pos === "undefined" || pos === null) {
		if (item) {
			pos = cc.p(
				item.getPositionX() + (item.getAnchorPoint().x ?
					0 : item.getContentSize().width * .5),
				item.getPositionY() + (item.getAnchorPoint().y ?
					0 : item.getContentSize().height * .5)
			);
		} else {
			return;
		}
	}
	
	circle = cc.Sprite.create("#TouchCircle.png");
	if (circle === null) {
		return;
	}
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Sequence.create(
		cc.DelayTime.create(0.5),
		cc.FadeOut.create(1),
		cc.RemoveSelf.create()
	));
	parentNode.addChild(circle, 10);

	circle = cc.Sprite.create("#TouchCircle.png");
	circle.setPosition(pos);
	circle.setScale(0.5);
	circle.runAction(cc.Spawn.create(
		cc.FadeOut.create(1.5),
		cc.Sequence.create(
			cc.ScaleBy.create(1.5, 2.5, 2.5),
			cc.RemoveSelf.create()
		)
	));
	parentNode.addChild(circle, 11);
};

