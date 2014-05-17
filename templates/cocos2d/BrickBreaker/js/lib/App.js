//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// The main App object is a singleton providing boot code, main functions, and other commonly-used, globally-accessible methods.
//
// 1. All code in this file is applicable to any game project in general.
// 2. If you need to extend the App object with project-specific code, use [BrickBreaker.js](BrickBreaker.html).
//

//
// ###  App
//
// Get or create the App object.
//
var App = App || {};

//
// ###  App.getTargetFrameRate
//
// Return the target frame rate to use. Scale back in HTML5 mode to save a CPU fan somewhere.
//
App.getTargetFrameRate = function() {
	return this.isHtml5() ? 30 : 60;
};

//
// ###  App.isHtml5
//
// Return true if the app is running in HTML5 mode.
//
App.isHtml5 = function() {
	if (typeof this._isHtml5 === "undefined") {
		App.assert(cc.sys);
		this._isHtml5 = cc.sys.isNative ? false : true;
	}
	return this._isHtml5;
};

//
// ###  App.isDesktop
//
// Return true if the app is running on a native desktop OS.
//
App.isDesktop = function() {
	if (typeof this._isDesktop === "undefined") {
		if (this.isHtml5()) {
			this._isDesktop = false;
		} else {
			this._isDesktop = (cc.sys.os === cc.sys.OS_OSX
				|| cc.sys.os === cc.sys.OS_WINDOWS
				|| cc.sys.os === cc.sys.OS_LINUX);
		}
	}
	return this._isDesktop;
};

//
// ###  App.rand
//
// Return a random integer between 0 and the given value.
//
App.rand = function(mod) {
	var r = Math.random();
	if (typeof mod !== 'undefined') {
		r *= 0xffffff;
		r = parseInt(r);
		r %= mod;
	}
	return r;
};

//
// ###  App.getWinSize
//
// Return the current size of the window or screen.
//
App.getWinSize = function() {
	var size = cc.director.getWinSizeInPixels();
	if (typeof this._winSize === 'undefined' || (size.width && size.height)) {
		this._winSize = size;
	}
	return this._winSize;
};

//
// ###  App.centralize
//
// Return a point relative to the center of the screen and scaled.
//
App.centralize = function(x, y) {
	var winSize = this.getWinSize();
	return cc.p(x + winSize.width * .5,
		y + winSize.height * .5);
};

//
// ###  App.alert
//
// Safely call `alert`.
//
App.alert = function(msg) {
	if(typeof alert === "function") {
		alert(msg);
	} else {
		cc.log(msg);
	}
};

//
// ###  App.assert
//
// Throw an error if the given object is undefined or boolean is false.
//
App.assert = function(objOrBool, errMsg) {
	if (typeof objOrBool === "undefined"
	|| (typeof objOrBool === "boolean" && !objOrBool)
	) {
		errMsg = errMsg || "Couldn't load the game. Please try a newer browser.";
		alert(errMsg);
		debugger;
		throw errMsg;
	}
};

//
// ###  App.clone
//
// Clone an object or array so the original can remained unchanged. If passed an undefined value, an empty array is returned.
//
App.clone = function(obj) {
	if(typeof obj !== "undefined") {
		return JSON.parse(JSON.stringify(obj));
	}
	return [];
};

//
// ###  App.localizeCurrency
//
// Return the currency amount localized. Currently the method only localizes to the United States currency format.
//
App.localizeCurrency = function(amount) {
	return "$" + parseFloat(amount).toFixed(2);
};

//
// ###  App.getLanguageCode
//
// Return the current language code. Example: `en`.
//
App.getLanguageCode = function() {
	var strings;
	
	if (typeof this._language === "undefined") {
		this._language = cc.sys.language;

		strings = App.config["strings"];
		if (strings && typeof strings[this._language] === "undefined") {
			cc.log("Don't have strings for language: " + this._language);
			this._language = "en";
		}
	}
	
	return this._language;
};

//
// ###  App.getLocalizedString
//
// Lookup and return a localized string. Configure localized strings in `App.config["strings"][languageCode]`.
//
App.getLocalizedString = function(key) {
	var strings,
		code = this.getLanguageCode();
	
	strings = App.config["strings"][code];
	if (typeof strings[key] !== "undefined") {
		return strings[key];
	}
	if (key && key.length) {
		cc.log("Couldn't find string[" + code + "][" + key + "]");
	}
	return "";
};

//
// ###  App.getRunningLayer
//
// Returns the running scene's child layer.
//
// Scenes can create a member variable named `layer` which will be used by this method.
//
App.getRunningLayer = function() {
	var node = cc.director.getRunningScene();
	if (node) {
		if (node.layer) {
			node = node.layer;
		}
	}
	return node;
};

//
// ###  App.callRunningLayer
//
// Call the running scene's layer's method.
//
App.callRunningLayer = function(methodName, param1, param2, param3) {
	var layer = this.getRunningLayer();
	if (layer && layer[methodName]) {
		layer[methodName](param1, param2, param3);
	} else {
		/*cc.log("Couldn't find method '" + methodName + "' in running scene or layer.");*/
	}
};

//
// ###  App.getResourcesToPreload
//
// Return an array of files to preload.
//
App.getResourcesToPreload = function() {
	var files = App.config["preload"],
		ret = [],
		i;

	if (files) {
		for (i = 0; i < files.length; i += 1) {
			if (files[i] && files[i].length) {
				ret[i] = files[i];
			}
		}
	}

	return ret;
};

//
// ###  App.runInitialScene
//
// Loads resources and calls the initial scene. Called by `App.main`.
//
App.runInitialScene = function() {
	var Scene = window[cc.game.config.initialScene],
		scene;
	
	scene = new Scene;
	scene.init();
	cc.director.runScene(scene);
};

//
// ###  App.setCanvasSize
//
// Sets the size of the game canvas.
//
App.setCanvasSize = function(e, w, h) {
	var allowHtmlRetina = false;
	this._pixelRatio = (allowHtmlRetina ? window.devicePixelRatio || 1 : 1);
	e = e || document.getElementById(cc.game.config[cc.game.CONFIG_KEY.id]);
	w = w || document.body.clientWidth; // or scrollWidth
	h = h || document.body.clientHeight;

	e.width = w * this._pixelRatio;
	e.height = h * this._pixelRatio;
	e.style.width = w + "px";
	e.style.height = h + "px";
	e.style.backgroundColor = document.body.style.backgroundColor;

	cc.log("Set #" + e.getAttribute("id") + " pixel ratio " + this._pixelRatio +
		", size " + e.width + "x" + e.height +
		", style " + e.style.width + " x " + e.style.height +
		", parent " + e.parentNode.getAttribute("id"));
	
	if (typeof this._origCanvasSize === "undefined") {
		this._origCanvasSize = {width: w, height: h};
	}
};

//
// ###  App.loadSoundEnabled
//
// Load the `soundEnabled` preference from local storage.
//
App.loadSoundEnabled = function() {
	var enabled = cc.sys.localStorage.getItem("soundEnabled");
	/*cc.log("Loaded sound enabled: " + enabled);*/
	
	if (enabled === null || enabled === "") {
		this.enableSound(true);
	} else {
		this._soundEnabled = (enabled === "true" || enabled === true);
	}
	/*cc.log("Sound enabled is now: " + this._soundEnabled);*/
};

//
// ###  App.enableSound
//
// Enable or disable sound.
//
App.enableSound = function(enabled) {
	this._soundEnabled = enabled ? true : false;
	cc.sys.localStorage.setItem("soundEnabled", this._soundEnabled);

	if (!this.isSoundEnabled()) {
		cc.audioEngine.stopMusic();

		/* Check that the music stopped (Chrome bug). */
		cc.director.getRunningScene().schedule(function(){
			if (!App.isSoundEnabled()) {
				cc.audioEngine.stopMusic();
			}
		}, 1, 15);
	}
};

//
// ###  App.toggleSoundEnabled
//
// Toggle whether sound is enabled.
//
App.toggleSoundEnabled = function() {
	this.enableSound(!this.isSoundEnabled());
};

//
// ###  App.isSoundEnabled
//
// Return true if sound is enabled.
//
App.isSoundEnabled = function() {
	return this._soundEnabled ? true : false;
};

//
// ###  App.playEffect
//
// Plays the sound effect with the given filename if sound is enabled.
//
App.playEffect = function(filename) {
	if (this.isSoundEnabled()) {
		/* Automatically prefix with resource path. */
		if (cc.loader.resPath && filename.indexOf("/") < 0) {
			filename = cc.loader.resPath + "/" + filename;
		}
		return cc.audioEngine.playEffect(filename);
	}
	return -1;
};

//
// ###  App.stopEffect
//
// Stops the sound effect with the given id.
//
App.stopEffect = function(audioId) {
	cc.audioEngine.stopEffect(audioId);
};

//
// ###  App.playMusic
//
// Plays the music file with the given filename if sound is enabled.
//
App.playMusic = function(filename) {
	if (this.isSoundEnabled()) {
		cc.audioEngine.stopMusic();
		cc.audioEngine.playMusic(filename);
	}
};

//
// ###  App.boot
//
// Boot method. Different for HTML5 versus native. Called at the end of this file.
//
App.boot = function(global) {
	if (this.isHtml5()) {
		App.setCanvasSize();
		App.setCanvasSize(document.getElementById("gameDiv"),
			this._origCanvasSize.width, this._origCanvasSize.height);
	} else {
		/* Implement timers. */
		require("js/lib/timers.js");
		this.timerLoop = makeWindowTimer(global, function(ms){});
		cc.director.getScheduler().scheduleCallbackForTarget(this, this.timerLoop);
	}

	/*setTimeout(function(){cc.log("Confirmed setTimeout() works");}, 3333);*/

	/* Embed the equivalent of main.js for faster loading. */
	cc.game.onStart = function(){
		App.main();
	};

	/*
	Native client boot happens like this:
		1. cc.game.run() ->
		2. cc.game.prepare() ->
		3. jsb.js ->
		4. jsb_cocos2d.js, etc...
	*/
	cc.game.run();
};

//
// ###  App.main
//
// The main method. Called by `cc.game.onStart`.
//
App.main = function() {
	var i,
		size = {},
		sheets,
		cacher,
		dirs = [];

	/* Get config */
	App.config = App.config || {};
	for (i in cc.game.config) {
		if (cc.game.config.hasOwnProperty(i)) {
			App.config[i] = App.clone(cc.game.config[i]);
		}
	}

	this.loadSoundEnabled();

	cc.defineGetterSetter(App, "winSize", App.getWinSize);
	size.width = cc.game.config.designWidth || App.winSize.width;
	size.height = cc.game.config.designHeight || App.winSize.height;
	cc.director.setDisplayStats(cc.game.config[cc.game.CONFIG_KEY.showFPS]);
	cc.view.setDesignResolutionSize(size.width, size.height, cc.ResolutionPolicy.SHOW_ALL);
	cc.view.resizeWithBrowserSize(true);

	App.contentHeight = App.winSize.height;
	App.contentWidth = App.contentHeight * (size.width / size.height);
	App.contentX = (App.winSize.width - App.contentWidth) * .5;
	App.contentY = 0;

	cc.loader.resPath = cc.game.config.resourcePath;
	cc.director.setAnimationInterval(1.0 / this.getTargetFrameRate());
	cc.log(parseInt(App.winSize.width) + " x " + parseInt(App.winSize.height)
		+ ", language: " + App.getLanguageCode()
		+ ", " + parseInt(1.0 / cc.director.getAnimationInterval()) + " fps");

	if (this.isHtml5()) {
		App.addImageData = function() {};
	} else {
		App.config["font"] = "res/" + App.config["font"] + ".ttf";
	}

	/* Preload. */
	cc.LoaderScene.preload(App.getResourcesToPreload(), App.runInitialScene, this);
};

//
// ###  Boot
//
// Call `App.boot` passing in the global variable.
//
App.boot(this);
