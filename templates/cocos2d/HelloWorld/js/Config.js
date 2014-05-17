//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// The game client's config file. Used to localize the game, configure plugins and provide other settings and preferences.
//
var App = App || {};

App.config = {
//
// ###  strings
//
// Localize your app by providing strings grouped by language code. If a string is not found for the current language code, the default `en` will be used.
//
	"strings": {
		"en": {
			"hello-world": "Hello World!",
			"you-are-player-number": "Your magic number is %d."
		}
	},
	
//
// ###  preload
//
// Specify resources to preload.
//
	"preload": [
		"spritesheet.plist",
		"spritesheet.png"
	],

//
// ###  spritesheets
//
// Specify spritesheets to be used.
//
	"spritesheets": [
		"spritesheet.plist"
	],
	
//
// ###  font
//
// The font to be used.
//
	"font": "Arial",
	
//
// ###  click-sounds
//
// An array of click sounds to be used when tapping the Hello World layer.
//
	"click-sounds": [
		"res/Drop1.wav",
		"res/Drop2.wav",
		"res/Drop3.wav"
	],

//
// ###  loader
//
// Settings for the loading scene.
//
	"loader": {
		"bg-color": cc.color(253, 252, 255, 255),
		"text": "L o a d i n g . . .",
		"text-font": "Arial",
		"text-color": cc.color(180, 180, 180, 255),
		"text-size": 20,
		"bar-color": cc.color(9, 9, 10, 255),
		"image-win-size-percent": 0.5
	},


	unused: null
};
