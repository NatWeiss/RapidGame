//
// Make `cc.loader` think that these files have already been loaded.
//
// Used when minified.
//
(function(){
	if (cc && cc.loader) {
		var i,
			files = cc.game.config[cc.game.CONFIG_KEY.jsList],
			cache = cc.loader._jsCache;
		for (i = 0; i < files.length; i += 1) {
			cc.loader._jsCache[files[i]] = true;
		}
	}
}());
