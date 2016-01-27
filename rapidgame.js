//
//  Part of the [RapidGame](https://github.com/natweiss/rapidgame) project.
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nathanael Weiss.
//
var http = require("http"),
	path = require("path-extra"),
	fs = require("fs"),
	cmd = require("commander"),
	replace = require("replace"),
	download = require("download"),
	glob = require("glob"),
	wrench = require("wrench"),
	child_process = require("child_process"),
	packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))),
	cmdName = packageJson.name,
	version = packageJson.version,
	cocos2dxVer = "3.9",
	cocos2dxUrl = "http://cdn.cocos2d-x.org/cocos2d-x-3.9.zip",
	extractName = "cocos2d-x-3.9", // leave blank if cocos2d-x is properly zipped within a 'cocos2d-x/' folder
	cocos2dDirGlob = "*ocos2d-x*",
	category,
	engines = [],
	templates = [],
	builds = [],
	orientations = ["landscape", "portrait"],
	platforms = ["headers", "ios", "mac", "android", "windows", "linux"],
	copyCount = 0,
	msBuildExePath,
	libExePath,
	vcTargetsPath,
	doJSB = false,
	defaults = {
		engine: "cocos2dx",
		template: "TwoScene",
		package: "org.mycompany.mygame",
		dest: process.cwd(),
		prefix: path.join(path.homedir(), ".rapidgame"),
		src: path.join(path.homedir(), ".rapidgame", "src", "cocos2d-x"),
		dest: path.join(path.homedir(), ".rapidgame", cocos2dxVer),
		orientation: orientations[0]
	};

//
// list directories (path.join is called on all arguments)
//
var listDirectories = function() {
	var i, src, dirs;
	for (i = 0; i < arguments.length; i += 1) {
		src = (src ? path.join(src, arguments[i]) : arguments[i]);
	}
	dirs = glob.sync(src);
	for (i = 0; i < dirs.length; i++) {
		dirs[i] = path.basename(dirs[i]);
	}
	return dirs;
};

//
// get engines and templates
//
engines = listDirectories(__dirname, "templates", "*");
templates = listDirectories(__dirname, "templates", "cocos2dx", "*");

//
// Main run method.
//
var run = function(args) {
	var i, commands = [], commandFound = false;
	checkUpdate();
	args = args || process.argv;
	cmd
		.version(version)
		.option("-v, --verbose", "be verbose", false)
		.option("-p, --prefix <path>", "rapidgame home [" + defaults.prefix + "]", defaults.prefix)
		.option("-s, --src <path>", "cocos2d-x home [" + defaults.src + "]", defaults.src)
		.option("-d, --dest <name>", "library destination [" + defaults.dest + "]", defaults.dest)
		.option("-t, --template <name>", "template [" + defaults.template + "]", defaults.template)
		.option("-f, --folder <path>", "output folder of created project [" + defaults.dest + "]", defaults.dest)
		.option("--minimal", "prebuild only debug libraries and use minimal architectures", false)
		//.option("--i386", "on iphonesimulator, build i386 instead of x86_64", false)
		.option("--nostrip", "do not strip the prebuilt libraries", false);

	cmd
		.command("create <engine> <project-name> <package-name>")
		.description("     Create a new cross-platform game project")
		.action(createProject);
	commands.push("create");

	cmd
		.command("prebuild [platform]")
		.description("                            Prebuild cocos2d-x static libraries and headers")
		.action(prebuild);
	commands.push("prebuild");

	cmd
		.command("clean")
		.description("                            Clean the temporary build files")
		.action(clean);
	commands.push("clean");

	cmd
		.command("show")
		.description("                            Show where static libraries and headers reside")
		.action(showPrefix);
	commands.push("show");

	cmd
		.command("init <directory>")
		.description("                            Create a symlink named 'lib' to the static libraries")
		.action(init);
	commands.push("init");

	cmd.on("--help", usageExamples);

	cmd
		.parse(args)
		.name = cmdName;

	if (!cmd.args.length) {
		usage();
	} else {
		// Check if command exists
		for (i = 0; i < commands.length; i += 1) {
			if (args[2] === commands[i]) {
				commandFound = true;
				break;
			}
		}
		if (!commandFound) {
			console.log("Command '" + args[2] + "' not found");
			usage();
		}
	}
};

//
// check that prefix directory is writeable
//
var checkPrefix = function() {
	// Test prefix dir.
	if (!isWriteableDir(cmd.prefix)) {
		// Complain if specified prefix dir.
		if (cmd.prefix !== defaults.prefix) {
			logErr("Cannot write files to prefix directory: " + cmd.prefix);
			return false;
		}
		
		// Make dir
		wrench.mkdirSyncRecursive(defaults.prefix);
		if (!isWriteableDir(defaults.prefix)) {
			logErr("Cannot write files to default prefix directory: " + defaults.prefix);
			return false;
		}
		
		// Success.
		cmd.prefix = defaults.prefix;
	}
	if (cmd.verbose) {
		console.log("Can successfully write files to prefix directory: " + cmd.prefix);
	}
	return true;
};

//
// Resolve dirs.
//
var resolveDirs = function() {
	if (cmd.prefix !== defaults.prefix) {
		cmd.prefix = path.resolve(cmd.prefix);
		if (!dirExists(cmd.prefix)) {
			logBuild("Invalid prefix dir: " + cmd.prefix, true);
			return false;
		}
	}
	if (cmd.src !== defaults.src) {
		cmd.src = path.resolve(cmd.src);
		if (!dirExists(cmd.src)) {
			logBuild("Invalid src dir: " + cmd.src, true);
			return false;
		}
	}
	if (cmd.dest !== defaults.dest) {
		cmd.dest = path.resolve(path.join(cmd.prefix, cmd.dest));
	}
	return checkPrefix();
};

//
// Initialize the given directory.
//
var init = function(directory) {
	var src, dest;

	if (!resolveDirs()) {return 1;}
	if (!dirExists(directory)) {
		console.log("Output directory must exist: " + directory);
		return 1;
	}

	// Create lib symlink
	// Windows "EPERM: operation not permitted" probably means user needs to Run As Administrator
	// http://stackoverflow.com/questions/4051883/batch-script-how-to-check-for-admin-rights
	src = cmd.dest;
	dest = path.join(directory, "lib");
	console.log("Symlinking" + (cmd.verbose ? ": " + dest + " -> " + src : " lib folder"));
	try {
		fs.symlinkSync(src, dest);
	} catch(e) {
		logErr("Error creating symlink");
		if (process.platform === "win32") {
			logErr("\nPlease 'Run As Administrator'.\n");
		}
	}
};

//
// Clean the temp build files.
//
var clean = function(directory) {
	var i, j, dest, files = [], globbed = [],
		configs = ["Debug", "Release"];

	if (!resolveDirs()) {return 1;}

	// List dirs to clean.
	for (i = 0; i < configs.length; i += 1) {
		globbed = glob.sync(path.join(cmd.src, "build", configs[i] + "-*"));
		for (j = 0; j < globbed.length; j += 1) {
			files.push(globbed[j]);
		}
	}

	// Add Windows dirs to list.
	globbed = glob.sync(path.join(cmd.src, "**", "Debug.win32"));
	for (j = 0; j < globbed.length; j += 1) {
		files.push(globbed[j]);
	}
	globbed = glob.sync(path.join(cmd.src, "**", "Release.win32"));
	for (j = 0; j < globbed.length; j += 1) {
		files.push(globbed[j]);
	}

	// Remove dirs.
	for (i = 0; i < files.length; i += 1) {
		if (dirExists(files[i])) {
			console.log("Cleaning: " + files[i]);
			try {
				wrench.rmdirSyncRecursive(files[i], true);
			} catch(e) {
				logErr(e, cmd.verbose);
			}
		}
	}
};

//
// Show prefix.
//
var showPrefix = function(directory) {
	if (!resolveDirs()) {return 1;}
	
	console.log("Rapidgame lives here: " + cmd.prefix);
	console.log("Latest static libs and headers: " + cmd.dest);
	console.log("Static libs and headers have been built: " + (dirExists(cmd.dest) ? "YES" : "NO"));
	if (cmd.src != defaults.src) {
		console.log("src: " + cmd.src);
	}
};

//
// Create project.
//
var createProject = function(engine, name, package) {
	var dir = path.join(cmd.folder, name),
		src,
		dest,
		fileCount,
		i,
		onFinished,
		files,
		isCocos2d = false,
		packageSrc = "com.wizardfu." + cmd.template.toLowerCase();
		cmd.engine = engine.toString().toLowerCase();
	
	if (!resolveDirs()) {return 1;}
	category = "createProject";
	
	// Check engine and name
	if (!cmd.engine || !name || !package) {
		console.log("Engine, project name and package name are required, for example: " + cmdName + " cocos2dx \"HeckYeah\" com.mycompany.heckyeah");
		usage();
		return 1;
	}

	// Check if dirs exist
	if (dirExists(dir) || fileExists(dir)) {
		console.log("Output directory already exists: " + dir);
		return 1;
	}

	// Check engine
	if (engines.indexOf(cmd.engine) < 0) {
		console.log("Engine '" + cmd.engine + "' not found");
		console.log("Available engines are: " + engines.join(", "));
		usage();
		return 1;
	}
	
	// Check template
	src = path.join(__dirname, "templates", cmd.engine, cmd.template);
	if (!dirExists(src)) {
		console.log("Missing template directory: " + src);
		files = listDirectories(__dirname, "templates", cmd.engine, "*");
		if (files.length > 0) {
			console.log("Available templates for " + cmd.engine + " are: " + files.join(", ") + ".");
		}
		usage();
		return 1;
	}
	
	// Start
	logReport("start", cmd.engine + "/" + cmd.template);
	console.log("Rapidly creating a game");
	console.log("Engine: " + cmd.engine.charAt(0).toUpperCase() + cmd.engine.slice(1));
	console.log("Template: " + cmd.template + (cmd.verbose ? " " + packageSrc : ""));
	isCocos2d = (cmd.engine.indexOf("cocos") >= 0);
	
	// Copy all template files to destination
	dest = dir;
	console.log("Copying project files" + (cmd.verbose ? " from " + src + " to " + dest : ""));
	fileCount = copyRecursive(src, dest, true);
	if (cmd.verbose) {
		console.log("Successfully copied " + fileCount + " files");
	}
	
	// Replace project name
	console.log("Setting project name: " + name);
	replace({
		regex: cmd.template,
		replacement: name,
		paths: [dest],
		include: "*.js,*.plist,*.cpp,*.md,*.lua,*.html,*.json,*.xml,*.xib,*.pbxproj,*.xcscheme,*.xcworkspacedata,*.xccheckout,*.sh,*.cmd,*.py,*.rc,*.sln,*.txt,.classpath,.project,.cproject,makefile,manifest,*.vcxproj,*.user,*.filters,.name",
		recursive: true,
		silent: !cmd.verbose
	});

	// Replace package name
	console.log("Setting package name: " + package);
	replace({
		regex: packageSrc,
		replacement: package,
		paths: [dest],
		include: "*.js,*.plist,*.xml,makefile,manifest,*.settings,*.lua,.project,.identifier",
		recursive: true,
		silent: !cmd.verbose
	});
	
	// Rename files & dirs
	from = path.join(dest, "**", cmd.template + ".*");
	if (cmd.verbose) {
		console.log("Renaming all " + from + " files");
	}
	files = glob.sync(from);
	for (i = 0; i < files.length; i++) {
		from = files[i];
		to = path.join(path.dirname(from), path.basename(from).replace(cmd.template, name));
		if (cmd.verbose) {
			console.log("Moving " + from + " to " + to);
		}
		try {
			fs.renameSync(from, to);
		} catch(e) {
			logErr("Error moving file " + e);
		}
	}
	
	// Symlink
	if (isCocos2d) {
		init(dir);
	}
	
	// Npm install
	i = null;
	dest = path.join(dir, "server");
	onFinished = function(){
		// Show readme
		console.log("Done");
		try {
			var text = fs.readFileSync(path.join(dir, "README.md")).toString();
			console.log("");
			console.log(text);
			console.log("");
		} catch(e) {
		}
		logReport("done");
		
		// Auto prebuild
		if (isCocos2d && !dirExists(cmd.dest)) {
			console.log("");
			console.log("Static libraries must be prebuilt");
			prebuild();
		}
	};
	if (dirExists(dest) && !dirExists(path.join(dest, "node_modules"))) {
		console.log("Installing node modules");
		try {
			child_process.exec("npm install", {cwd: dest, env: process.env}, function(a, b, c){
				execCallback(a, b, c);
				onFinished();
			});
		} catch(e) {
			logErr("Error installing node modules: " + e);
		}
	} else {
		onFinished();
	}
};

//
// run the prebuild command
//
var prebuild = function(platform, config, arch) {
	if (!resolveDirs()) {return 1;}
	category = "prebuild";
	platform = (platform || "");
	platform = platform.toString().toLowerCase();
	config = config || "";
	arch = arch || "";
	if (platforms.indexOf(platform) < 0) {
		platform = "";
	}

	// initialize build log
	cmd.buildLog = path.join(cmd.prefix, "build-" + process.platform + ".log");
	try {
		fs.writeFileSync(cmd.buildLog, "");
		logBuild("Happily prebuilding: " + platform, true);
		console.log("Writing build log to: " + cmd.buildLog);
	} catch(e) {
		cmd.buildLog = "";
	}

	getToolPaths(function(success) {
		if (!success) {
			return;
		}

		logReport("start");
		
		copySrcFiles(function() {
			downloadCocos(function() {
				setupPrebuild(platform, function() {
					runPrebuild(platform, config, arch, function() {
						logReport("done");
					});
				});
			});
		});
	});
};

//
// copy src directory to prefix
//
var copySrcFiles = function(callback) {
	var src = path.join(__dirname, "src"),
		dest = path.join(cmd.prefix, "src");

	// Synchronously copy src directory to dest
	if (src !== dest && !dirExists(dest)) {
		logBuild("Copying " + src + " to " + dest, true);
		copyRecursive(src, dest, true);
	}

	callback();
};

//
// download cocos2d-x source
//
var downloadCocos = function(callback) {
	var dir = path.join(cmd.prefix, "src"),
		src,
		dest = cmd.src,
		downloaded = path.join(cmd.prefix, "src", "downloaded.txt"),
		doDownload = !dirExists(dest),
		ver;

	// no need to download if has a custom src
	if (cmd.src !== defaults.src) {
		callback();
		return;
	}

	// check downloaded version
	try{
		ver = fs.readFileSync(downloaded).toString().trim();
	} catch(e) {
	}
	if (ver !== cocos2dxUrl) {
		if (typeof ver !== "undefined") {
			logBuild("Current cocos2d-x URL: " + cocos2dxUrl, true);
			logBuild("Downloaded cocos2d-x URL: " + ver, true);
			logBuild("Re-downloading", true);
		}
		doDownload = true;
		try {
			wrench.rmdirSyncRecursive(dest, true);
		} catch(e) {
			logBuild(e, cmd.verbose);
			// try again
			try {wrench.rmdirSyncRecursive(dest, true);} catch(e) {}
		}
	}

	// no need to download
	if (!doDownload) {
		callback();
		return;
	}

	// warn about git existing
	src = path.join(cmd.prefix, ".git");
	if (dirExists(src)) {
		logBuild("WARNING: Directory " + src + " may prevent cocos2d-x from being patched with git apply", true);
	}
	
	// copy patch
	copyGlobbed(path.join(__dirname, "src"), dir, "*.patch");

	// download
	downloadUrl(cocos2dxUrl, dir, function(success) {
		if (!success) {
			return;
		}

		var globPath = path.join(dir, cocos2dDirGlob),
			files = glob.sync(globPath),
			patchSize,
			cmd;
		if (!files || files.length !== 1) {
			logErr("Couldn't glob " + globPath);
			return;
		}

		// Rename extract dir
		try {
			logBuild("Moving " + files[0] + " to " + dest, true);
			fs.renameSync(files[0], dest);

			// Save downloaded version
			fs.writeFileSync(downloaded, cocos2dxUrl);

			src = path.join(dir, "ccx.patch");
			patchSize = fs.statSync(src).size;
			if (patchSize > 8) {
				// Apply patch
				// (see comments at the end of this file for how to create the patch)
				logBuild("Applying patch file: " + src, true);

				// for some reason git apply sometimes does not work and produces no output...
				// (use the patch command instead)
				cmd = "patch -p1 < ";
				if (process.platform === "win32") {
					cmd = "git apply --whitespace=nowarn ";
				}
				cmd += '"' + src + '"';
				exec(cmd, {cwd: dest, env: process.env}, function(err){
					callback();
				});
			} else {
				logBuild("Skipping patch file (" + patchSize + " bytes): " + src, true);
				callback();
			}
		} catch(e) {
			logErr("Couldn't move " + files[0] + " to " + dest)
		}
	});
};

//
// prebuild setup (copies headers, java files, etc.)
//
var setupPrebuild = function(platform, callback) {
	var dir, src, dest, i, files;

	// Return if we are prebuilding a specific platform.
	if (platform && platform !== "headers") {
		logBuild("Not building headers", true);
		callback();
		return;
	}
	// Return if we have already prebuilt headers.
	if (!platform && dirExists(path.join(cmd.dest, "cocos2d", "x", "java", "mk"))) {
		logBuild("Already built headers", true);
		callback();
		return;
	}

	logBuild("Checking if symlinks can be created", true);

	// symlink ./latest -> ./version
	src = path.basename(cmd.dest);
	dest = path.join(cmd.prefix, "latest");
	try {
		fs.unlinkSync(dest);
	} catch(e) {
		//logErr("Error deleting symlink: " + e);
	}
	try {
		fs.symlinkSync(src, dest);
		logErr("Ok");
	} catch(e) {
		logErr("Error creating symlink " + dest + " => " + src);
		if (process.platform === "win32") {
			logErr("\nPlease 'Run As Administrator'. Proceeding with unpredictable results.\n");
		}
	}

	logBuild("Copying header files...", true);

	// reset cocos2d dir
	dest = path.join(cmd.dest, "cocos2d");
	files = ["html", path.join("x", "include"), path.join("x", "cmake"), path.join("x", "java"), path.join("x", "script")];
	try {
		for (i = 0; i < files.length; i += 1) {
			src = path.join(dest, files[i]);
			logBuild("rm -r " + src, cmd.verbose);
			wrench.rmdirSyncRecursive(src, true);
			
			logBuild("mkdir " + src, cmd.verbose);
			wrench.mkdirSyncRecursive(src);
		}
	} catch(e) {
		logBuild("Error cleaning destination", cmd.verbose);
		logBuild(e, cmd.verbose);
	}

	// copy cmake files
	dest = path.join(cmd.dest, "cocos2d", "x", "cmake");
	src = path.join(cmd.src, "cmake");
	copyRecursive(src, dest, false, true);

	// copy cocos2d-html5
	dest = path.join(cmd.dest, "cocos2d", "html");
	src = path.join(cmd.src, "web");
	copyRecursive(src, dest, false, true);

	// copy headers
	dir = dest = path.join(cmd.dest, "cocos2d", "x", "include");
	src = cmd.src;
	copyGlobbed(src, dest, '*.h');
	copyGlobbed(src, dest, '*.hpp');
	copyGlobbed(src, dest, '*.msg');
	copyGlobbed(src, dest, '*.inl');

	// remove unneeded
	files = ["docs", "build", "tests", "samples", "templates", "tools",
		path.join("plugin", "samples"), path.join("plugin", "plugins"), path.join("extensions", "proj.win32")];
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(path.join(dir, files[i]), true);
	}

	// jsb
	dest = path.join(cmd.dest, "cocos2d", "x", "script");
	src = path.join(cmd.src, "cocos", "scripting", "js-bindings", "script");
	copyGlobbed(src, dest, '*.js');

	// java
	dir = path.join(cmd.dest, "cocos2d", "x", "java");
	dest = path.join(dir, "cocos2d-x");
	src = path.join(cmd.src, "cocos", "platform", "android", "java");
	copyRecursive(src, dest);

	// mk
	dest = path.join(cmd.dest, "cocos2d", "x", "java", "mk");
	copyGlobbed(cmd.src, dest, "*.mk");

	// clean up
	files = ["proj.android", "cocos2d-js", path.join("cocos2d-x", "tools"), path.join("cocos2d-x", "templates"), path.join("cocos2d-x", "tests")];
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(path.join(dest, files[i]), true);
	}
	files = glob.sync(path.join(dir, "*", "bin"));
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(files[i], true);
	}
	files = glob.sync(path.join(dir, "*", "gen"));
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(files[i], true);
	}

	// find ${dir} | xargs xattr -c >> ${logFile} 2>&1

	callback();
};

//
// run the prebuild command
//
var runPrebuild = function(platform, config, arch, callback) {
	config = "";
	arch = "";

	// check whether to prebuild javascript bindings
	try{
		var configDest = path.join(cmd.dest, "cocos2d", "x", "include", "cocos", "base", "ccConfig.h"),
			ccConfig = fs.readFileSync(configDest).toString().trim();
		doJSB = (ccConfig.indexOf("CC_ENABLE_SCRIPT_BINDING 1") >= 0);
		console.log("Prebuild Javascript bindings: " + (doJSB ? "yes" : "no"));
	} catch(e) {
	}

	if (platform === "headers") {
		callback();
	} else if (platform === "mac") {
		prebuildMac("Mac", config, arch, callback);
	} else if (platform === "ios") {
		prebuildMac("iOS", config, arch, callback);
	} else if (platform === "linux") {
		prebuildLinux("Linux", config, arch, callback);
	} else if (platform === "windows") {
		prebuildWin("Windows", config, arch, callback);
	} else if (platform === "android") {
		prebuildAndroid("Android", config, arch, callback);
	} else {
		prebuildMac("Mac", config, arch, function(){
			prebuildMac("iOS", config, arch, function(){
				prebuildLinux("Linux", config, arch, function(){
					prebuildWin("Windows", config, arch, function(){
						prebuildAndroid("Android", config, arch, function(){
							callback();
						});
					});
				});
			});
		});
	}
};

//
// launch the next build
//
var nextBuild = function(platform, callback){
	// Show remaining builds.
	if (cmd.verbose) {
		logBuild("Remaining builds: ", true);
		for (i = 0; i < builds.length; i+=1) {
			logBuild("  Config: " + builds[i][0] + "\n  Dir: " + builds[i][2] + "\n  Command: " + builds[i][1] + " " + builds[i][3].join(" ") + "\n", true);
		}
	}

	// Launch this build.
	if (builds.length) {
		startBuild(platform, callback, builds.shift());
	} else {
		callback();
	}
};

//
// start a given build
//
var startBuild = function(platform, callback, settings) {
	var i,
		config = settings[0],
		command = settings[1],
		dir = settings[2],
		args = settings[3],
		func = settings[4],
		funcArg = settings[5];

	logBuild("Building: " + platform +
		(config ? " " + config : "") +
		(command ? " " + (cmd.verbose ? command : path.basename(command)) : "") +
		((cmd.verbose && dir) ? " " + dir : ""),
		true);

	spawn(command, args, {cwd: path.resolve(dir), env: process.env}, function(err){
		var onFinished = function(){
			logBuild("Succeeded.", true);
			nextBuild(platform, callback);
		};
		if (!err){
			// Run callback.
			if (typeof func === "function") {
				func(funcArg, onFinished);
			} else {
				onFinished();
			}
		} else {
			// Failed.
			if (!cmd.verbose) {
				console.log("Build failed. Please run with --verbose or check the build log: " + cmd.buildLog);
			}
		}
	});
};

//
// prebuild mac
//
var prebuildMac = function(platform, config, arch, callback) {
	var i, j, k, dir, project, func, funcArg, derivedDir, dest,
		sdks = (platform === "Mac" ? ["macosx"] : ["iphoneos", "iphonesimulator"]),
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"])),
		projs = [
			path.join(cmd.src, "build", "cocos2d_libs.xcodeproj")
		];
	if (doJSB !== false) {
		projs.push(path.join(cmd.src, "cocos", "scripting", "js-bindings", "proj.ios_mac", "cocos2d_js_bindings.xcodeproj"));
	}

	// Bail if not on Mac.
	if (process.platform !== "darwin") {
		logBuild("Can only build " + platform + " on Mac", true);
		callback();
		return;
	}

	// Create builds array.
	for (i = 0; i < configs.length; i += 1) {
		for (j = 0; j < sdks.length; j += 1) {
			for (k = 0; k < projs.length; k += 1) {
				command = "xcodebuild";
				dir = path.dirname(projs[k]);
				derivedDir = path.join(cmd.src, "build", configs[i] + "-" + sdks[j]);
				args = [
					"-project", path.basename(projs[k]),
					"-configuration", configs[i],
					"-sdk", sdks[j],
					"-derivedDataPath", path.resolve(derivedDir)
				];
				if (k == 0) { // first proj is libcocos2d
					//"-scheme", "\"libcocos2d " + platform + "\"", // this doesn't spawn correctly
					args = args.concat(["-scheme", "libcocos2d " + platform]);
				} else { // second proj is libjscocos2d
					args = args.concat(["-scheme", "libjscocos2d " + platform]);
				}
				if (sdks[j] === "iphoneos") {
					if (cmd.minimal) {
						args = args.concat(["-arch", "armv7"]);
					} /*else {
						args = args.concat([
							"-destination", "platform=iOS,name=iPhone 6s",
							"-destination-timeout", "5"
						]);
					}*/
				} else if (sdks[j] === "iphonesimulator") {
					// des it need "generic/" in the destination? is that why it doesn't run correctly on 5s?
					args = args.concat([
						"-destination", "platform=iphonesimulator,name=iPhone 6s",
						"-destination-timeout", "5"
					]);
					/*if (cmd.i386) {
						args = args.concat(["-arch", "i386"]);
					} else {
						// why doesn't this make iphonesimulator libs have both i386 and x86_64? is one being stripped away?
						//args = args.concat(["-arch", "x86_64", "-arch", "i386"]);
						args = args.concat(["-arch", "x86_64"]);
					}*/
				}
				
				// final bit of command (xcode settings)
				args.push("GCC_SYMBOLS_PRIVATE_EXTERN=NO");
				args.push("OTHER_CPLUSPLUSFLAGS=-w");
				if (!cmd.nostrip) {
					args.push("DEPLOYMENT_POSTPROCESSING=YES");
					args.push("STRIP_INSTALLED_PRODUCT=YES");
					args.push("STRIP_STYLE=non-global");
				}
				
				// Post-build function.
				func = linkMac;
				funcArg = configs[i] + "-" + sdks[j];

				// Push this build.
				builds.push([configs[i], command, dir, args, func, funcArg]);
			
				// Prepare link command.
				command = "libtool";
				dir = path.join(path.resolve(derivedDir), "Build", "Products");

				dest = path.join(cmd.dest, "cocos2d", "x", "lib", configs[i] + "-" + platform, sdks[j]);
				wrench.mkdirSyncRecursive(dest);
				dest = path.join(dest, "libcocos2dx-prebuilt.a");

				// Link.
				args = [
					"-static",
					"-o", dest,
					"-filelist", path.join(dir, "list.txt")
					// this doesn't use derived data:
					//   xcodebuild -project src/cocos2d-x/build/cocos2d_libs.xcodeproj -target "libcocos2d Mac" -showBuildSettings | grep BUILD_DIR
				];
				builds.push([configs[i], command, dir, args, false, false]);
			}
		}
	}
	nextBuild(platform, callback);
};

//
// link mac
//
var linkMac = function(configPlatform, callback) {
	var i, txt,
		d = path.join(cmd.src, "build", configPlatform, "Build", "Products"),
		files = [];
	files = glob.sync(path.join(d, "**", "*.a"));
	d = path.join(d, "list.txt");
	txt = files.join("\n") + "\n";
	logBuild("Writing file list:\n  " + d + "\n    " + files.join("\n    "));
	fs.writeFileSync(d, txt);
	callback();
};

//
// prebuild linux
//
var prebuildLinux = function(platform, config, arch, callback) {
	var i, dir, args, func, funcArg,
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"]));

	// Bail if not on Linux.
	if (process.platform !== "linux") {
		logBuild("Can only build " + platform + " on Linux", true);
		callback();
		return;
	}

	// create builds array
	builds = [];
	for (i = 0; i < configs.length; i += 1) {
		dir = path.join(cmd.src, "build", configs[i] + "-linux");
		funcArg = configs[i];// + "-Linux";
		args = [
			path.join("..", ".."),
			"-DDEBUG_MODE=" + (configs[i] === "Debug" ? "ON" : "OFF"),
			//"-DUSE_CHIPMUNK=OFF",
			//"-DUSE_BOX2D=OFF",
			//"-DUSE_BULLET=OFF",
			//"-DUSE_RECAST=OFF",
			//"-DUSE_WEBP=OFF",
			"-DBUILD_EXTENSIONS=OFF",
			"-DBUILD_EDITOR_SPINE=OFF",
			"-DBUILD_EDITOR_COCOSTUDIO=OFF",
			"-DBUILD_EDITOR_COCOSBUILDER=OFF",
			"-DBUILD_CPP_TESTS=OFF",
			"-DBUILD_LUA_LIBS=OFF",
			"-DBUILD_LUA_TESTS=OFF",
			"-DBUILD_JS_TESTS=OFF"
		];
		if (doJSB !== false) {
			args.push("-DBUILD_JS_LIBS=ON");
		} else {
			args.push("-DBUILD_JS_LIBS=OFF");
		}
		wrench.mkdirSyncRecursive(dir);
		builds.push([configs[i], "cmake", dir, args, false, false]);
		builds.push([configs[i], "make", dir, [], linkLinux, funcArg]);
	}
	nextBuild(platform, callback);
};

//
// link linux
//
var linkLinux = function(config, callback) {
	var libDir = path.join(cmd.src, "build", config + "-linux", "lib"),
		dest = path.join(cmd.dest, "cocos2d", "x", "lib", config + "-Linux", "x86");

	// make output dir
	wrench.mkdirSyncRecursive(dest);

	// just copy static libraries
	copyGlobbed(libDir, dest, "*.a");
	
	// remember to call callback when finished
	callback();
};

//
// prebuild windows
//
var prebuildWin = function(platform, config, arch, callback) {
	var i, j, command, dir, args, func, funcArg, targets, projs = [],
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"]));

	// Bail if not on Windows.
	if (process.platform !== "win32") {
		logBuild("Can only build win32 on Windows", true);
		callback();
		return;
	}

	// set vc targets path
	process.env["VCTargetsPath"] = vcTargetsPath;

	// create builds
	builds = [];
	for (i = 0; i < configs.length; i += 1) {
		command = msBuildExePath;
		dir = path.homedir();// cmd.prefix;
		func = linkWin;
		funcArg = configs[i];
		targets = ["libcocos2d"];
		if (doJSB) {
			targets.push("libjscocos2d");
		}
		args = [
			path.join(cmd.src, "build", "cocos2d-win32.sln"),
			"/nologo",
			"/maxcpucount:4",
			"/t:" + targets.join(";"),
			//"/p:VisualStudioVersion=12.0",
			//"/p:PlatformTarget=x86",
			//"/verbosity:diag",
			//"/clp:ErrorsOnly",
			//"/p:nowarn=4005",
			//'/p:WarningLevel=0',
			"/p:configuration=" + configs[i] + ";platform=Win32"
		];

		// push this build
		builds.push([configs[i], command, dir, args, func, funcArg]);
	}

	// start
	nextBuild("Windows", callback);
};

//
// link windows
//
var linkWin = function(config, callback) {
	var i,
		command = path.basename(libExePath),
		src = path.join(cmd.src, "build", config + ".win32"),
		dest = path.join(cmd.dest, "cocos2d", "x", "lib", config + "-win32", "x86"),
		args = [
			'/NOLOGO',
			'/IGNORE:4006',
			//'/OPT:REF',
			//'/OPT:ICF',
			//'/OUT:"' + path.join(dest, "libcocos2dx-prebuilt.lib") + '"',
			//'"' + path.join(src, "*.lib") + '"'
			'/OUT:' + path.join(dest, "libcocos2dx-prebuilt.lib"),
			path.join(src, "*.lib")
		];

	// make output dir
	wrench.mkdirSyncRecursive(dest);

	// copy dlls and finish creating command
	//copyGlobbed(path.join(src, "external", "lua", "luajit", "prebuilt", "win32"), dest, "*.dll");
	copyGlobbed(src, dest, "*.dll");
	copyGlobbed(src, dest, "glfw3.lib"); // possibly because of the new duplicate -2015.lib files, this is necessary...
	copyGlobbed(src, dest, "glfw3-2015.lib");
	copyGlobbed(src, dest, "libchipmunk.lib");
	copyGlobbed(src, dest, "libchipmunk-2015.lib");
	copyGlobbed(src, dest, "libjpeg.lib");
	copyGlobbed(src, dest, "libjpeg-2015.lib");
	copyGlobbed(src, dest, "libpng.lib");
	copyGlobbed(src, dest, "libpng-2015.lib");
	copyGlobbed(src, dest, "libtiff.lib");
	copyGlobbed(src, dest, "libtiff-2015.lib");

	// move unneeded file(s)
	try {
		// this must be done because both of these libpng.lib files contain pngwin.res and lib.exe errors with LNK1241
		// (consider instead using /REMOVE option: https://msdn.microsoft.com/en-us/library/0xb6w1f8.aspx)
		fs.renameSync(path.join(src, "libpng-2015.lib"), path.join(src, "libpng-2015.duplicate-lib"));
	} catch(e) {
	}

	// execute
	spawn(command, args, {cwd: path.dirname(libExePath), env: process.env}, function(err){
		if (!err) {
			callback();
		} else {
			logBuild(err, true);
		}
	});
};

//
// prebuild android
//
var prebuildAndroid = function(platform, config, arch, callback) {
	var i, j, src, dest, command, args = [], func, funcArg, ndkToolchainVersion = "",
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"])),
		archs = (cmd.minimal ? ["armeabi"] : ["armeabi", "armeabi-v7a", "x86"]),
		toolchains = ["4.9", "4.8", "4.7"];

	// All platforms require NDK_ROOT environment variable.
	if (!("NDK_ROOT" in process.env)) {
		logBuild("Can only build Android with a proper SDK and NDK installation.", true);
		logBuild("(Missing NDK_ROOT environment variable.)", true);
		logBuild("See: http://bit.ly/rapidgame-android-readme", true);
		callback();
		return;
	}
	
	// Determine which toolchain to use.
	for (i = 0; i < toolchains.length; i += 1) {
		if (dirExists(path.join(process.env["NDK_ROOT"], "toolchains", "arm-linux-androideabi-" + toolchains[i]))) {
			ndkToolchainVersion = toolchains[i];
			break;
		}
	}
	if (ndkToolchainVersion.length <= 0) {
		logBuild("No suitable toolchain version found in: " + path.join(process.env["NDK_ROOT"], "toolchains"), true);
		logBuild("Acceptable versions: " + toolchains.join(", "), true);
		callback();
		return;
	}

	// create builds array
	builds = [];
	for (i = 0; i < configs.length; i += 1) {
		// Copy proj.android to dest only if not exists (otherwise would remove intermediate build files).
		src = path.join(cmd.prefix, "src", "proj.android");
		dest = path.join(cmd.src, "build", configs[i] + "-Android");

		// Always copy latest Android build files.
		logBuild("Copying " + src + " to " + dest, false);
		wrench.mkdirSyncRecursive(dest);
		//copyGlobbed(src, dest, "build.sh");
		//copyGlobbed(src, dest, "makefile");
		copyGlobbed(path.join(src, "jni"), path.join(dest, "jni"), "*");

		// Set func.
		func = linkAndroid;

		for (j = 0; j < archs.length; j += 1) {
			// Run the ndk-build.
			command = path.join(process.env["NDK_ROOT"], "ndk-build" + (process.platform === "win32" ? ".cmd" : ""));
			args = [
				"-C", dest,
				"NDK_TOOLCHAIN_VERSION=" + ndkToolchainVersion,
				"NDK_MODULE_PATH=" + cmd.src,
				"APP_PLATFORM=" + "android-18",
				"APP_ABI=" + archs[j],
				"CONFIG=" + configs[i],
				"DO_JS=" + (doJSB ? "1" : "0")
			];
			funcArg = configs[i] + "-" + archs[j];
			builds.push([configs[i], command, dest, args, func, funcArg]);
		}
	}
	nextBuild("Android", callback);
};

//
// link android
//
var linkAndroid = function(configArch, callback) {
	var a, src, dest, config = "", arch = "";
	
	// Copy these prebuilt files.
	a = configArch.split("-");
	if (a.length >= 2) {
		config = a[0];
		arch = a[1];

		src = path.join(cmd.src, "build", config + "-Android", "obj", "local", arch);
		dest = path.join(cmd.dest, "cocos2d", "x", "lib", config + "-Android", arch);
		
		logBuild("Copying Android libraries from " + src + " to " + dest, false);
		copyGlobbed(src, dest, "*.a");
	} else {
		logBuild("Failed to link Android because couldn't get config and arch from: " + configArch, true);
	}

	// Copy other prebuilt libs.
	dest = path.join(cmd.dest, "cocos2d", "x", "lib", "Debug-Android");
	copyGlobbed(path.join(cmd.src, "external"), dest, "*.a", "android", 1);
	dest = path.join(cmd.dest, "cocos2d", "x", "lib", "Release-Android");
	copyGlobbed(path.join(cmd.src, "external"), dest, "*.a", "android", 1);
	
	callback();

// build.sh used to combine all the .a files into one libcocos2dx-prebuilt.a like this:
/*
ar=$(ndk-which ar)
strip=$(ndk-which strip)
lib="libcocos2dx-prebuilt.a"
rm -f ${dest}/${lib}
for dir in audioengine_static  cocos2dx_internal_static  cocos_extension_static  cocos_ui_static  cocostudio_static  spine_static \
	box2d_static  cocos2dxandroid_static  cocos_flatbuffers_static  cocosbuilder_static  bullet_static  cocos3d_static \
	cocos_network_static  cocosdenshion_static  recast_static
do
	${ar} rs ${dest}/${lib} $(find ${src}/${dir} -name *.o)
	if [ "$3" != "nostrip" ]; then
		${strip} -x ${dest}/${lib}
	fi
done
*/
};

//
// Get paths to needed tools.
//
var getToolPaths = function(callback) {
	if (process.platform === "win32") {
		getMSBuildPath(function(success){
			if (!success) {
				callback(false);
				return;
			}
			getLibExePath(function(success){
				if (!success) {
					callback(false);
					return;
				}
				getVCTargetsPath(function(success){
					callback(success);
				});
			});
		});
	} else {
		callback(true);
	}
};

//
// get the ms build tools path
//
var getMSBuildPath = function(cb) {
	var Winreg = require("winreg"),
		root = '\\Software\\Microsoft\\MSBuild\\ToolsVersions',
		regKey,
		savePath = path.join(cmd.prefix, "msbuildpath.txt"),
		callback = function() {
			if (fileExists(msBuildExePath)) {
				try{
					fs.writeFileSync(savePath, msBuildExePath).toString().trim();
				} catch (e) {
				}
				logBuild("MSBUILD: " + msBuildExePath, true);
				cb(true);
			} else {
				console.log("Unable to locate MSBuild.exe. Please set the contents of the following file to the absolute path to MSBuild.exe:\n\n\t" + savePath + "\n\nExample: C:\\Path\\to\\MSBuild.exe");
				cb();
			}
		};

	// try to load saved path
	try{
		msBuildExePath = fs.readFileSync(savePath).toString().trim();
		if (msBuildExePath.length > 0) {
			callback();
			return;
		}
	} catch(e) {
	}

	// find path to MSBuildToolsPath
	regKey = new Winreg({key: root});
	regKey.keys(function (err, items) {
		var i, key, highest = 0, buildPath = '', count = 0;
		if (err) {
			logBuild(err, true);
			callback();
		}
		for (i = 0; i < items.length; i += 1) {
			key = path.basename(items[i].key);
			regKey = new Winreg({key: root + '\\' + key});	
			(function(key){
				regKey.get("MSBuildToolsPath", function(err, item) {
					count += 1;
					if (err) {
						logBuild(err, true);
					} else if (typeof item === "object" && typeof item.value === "string" && item.value.length) {
						logBuild("Potential MSBuildToolsPath: " + item.value);
						logBuild("Checking version = " + parseFloat(key) + " against highest " + highest);
						if (parseFloat(key) > highest) {
							buildPath = item.value;
							highest = parseFloat(key);
						}
					}
					if (count === items.length) {
						if (buildPath.length) {
							logBuild("Final MSBuildToolsPath: " + buildPath);
							msBuildExePath = path.join(buildPath, "MSBuild.exe");
						}
						callback();
					}
				});
			})(key);
		}
	});
};

//
// get the VCTargetsPath
// (todo: mine this from the registry \\Software\\Microsoft\\MSBuild\\ToolsVersions\\X\\VCTargetsPath)
//
var getVCTargetsPath = function(cb) {
	var i,
		ret,
		bases = [
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\V140\\",
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\V120\\",
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\V110\\",
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\"
		],
		names = [
			"C:\\Program Files (x86)",
			"\\Program Files (x86)",
			"C:\\Program Files",
			"\\Program Files"
		],
		savePath = path.join(cmd.prefix, "vctargetspath.txt"),
		callback = function() {
			if (dirExists(vcTargetsPath)) {
				try{
					fs.writeFileSync(savePath, vcTargetsPath).toString().trim();
				} catch (e) {
				}
				logBuild("VCTARGETS: " + vcTargetsPath, true);
				cb(true);
			} else {
				console.log("Unable to locate VCTargetsPath directory. Please set the contents of the following file to the absolute path to VCTargets:\n\n\t" + savePath + "\n\nExample: " + names[0] + bases[0]);
				cb();
			}
		};

	// try to load saved path
	try{
		vcTargetsPath = fs.readFileSync(savePath).toString().trim();
		if (vcTargetsPath.length > 0) {
			callback();
			return;
		}
	} catch(e) {
	}

	// determine path
	for (j = 0; j < bases.length; j += 1) {
		for (i = 0; i < names.length; i += 1) {
			ret = names[i] + bases[j];
			if (dirExists(ret)) {
				if (cmd.verbose) {
					logBuild("VCTargetsPath: " + ret);
				}
				vcTargetsPath = ret;
				callback();
				return;
			}
		}
	}
	callback();
};

//
// get the vc bin dir and append lib.exe
// todo: mine this from the registry
// or mimic python's find_vcvarsall
// http://stackoverflow.com/questions/6551724/how-do-i-point-easy-install-to-vcvarsall-bat
// or:
// http://cmake.3232098.n2.nabble.com/How-to-find-vcvarsall-bat-e-g-at-quot-C-Program-Files-x86-Microsoft-Visual-Studio-12-0-VC-quot-CMAKE-td7587359.html
//
var getLibExePath = function(cb) {
	var i, j, ret,
		bases = [
			"C:\\Program Files (x86)",
			"\\Program Files (x86)",
			"C:\\Program Files",
			"\\Program Files"
		],
		names = [
			"\\Microsoft Visual Studio 14.0\\VC\\bin\\",
			"\\Microsoft Visual Studio 12.0\\VC\\bin\\"
		],
		savePath = path.join(cmd.prefix, "libexepath.txt"),
		callback = function() {
			if (fileExists(libExePath)) {
				try{
					fs.writeFileSync(savePath, libExePath).toString().trim();
				} catch (e) {
				}
				logBuild("LIB: " + libExePath, true);
				cb(true);
			} else {
				console.log("Unable to locate lib.exe. Please set the contents of the following file to the absolute path to lib.exe:\n\n\t" + savePath + "\n\nExample: " + bases[0] + names[0]);
				cb();
			}
		};

	// try to load saved path
	try{
		libExePath = fs.readFileSync(savePath).toString().trim();
		if (libExePath.length > 0) {
			callback();
			return;
		}
	} catch(e) {
	}

	// determine path
	for (j = 0; j < bases.length; j += 1) {
		for (i = 0; i < names.length; i += 1) {
			ret = bases[j] + names[i];
			if (dirExists(ret)) {
				if (cmd.verbose) {
					logBuild("Lib.exe: " + ret);
				}
				libExePath = path.join(ret, 'lib.exe');
				callback();
				return;
			}
		}
	}
	callback();
};

//
// Copy files recursively with a special exclude filter.
//
var copyRecursive = function(src, dest, filter, overwrite) {
	logBuild("cp -r " + path.relative(cmd.prefix, src) + " " + path.relative(cmd.prefix, dest), cmd.verbose);
	
	// copy using wrench
	overwrite = overwrite || false;
	var options = {
			forceDelete: overwrite, // false Whether to overwrite existing directory or not
			excludeHiddenUnix: false, // Whether to copy hidden Unix files or not (preceding .)
			preserveFiles: !overwrite, // true If we're overwriting something and the file already exists, keep the existing
			preserveTimestamps: true, // Preserve the mtime and atime when copying files
			inflateSymlinks: false // Whether to follow symlinks or not when copying files
		};
	if (filter === true) {
		options.exclude = excludeFilter;
	}
	copyCount = 0;
	wrench.copyDirSyncRecursive(src, dest, options);
	return copyCount;
};

//
// copy files using glob
//
var copyGlobbed = function(src, dest, pattern, grep, depth) {
	var i, j, file, files;
	pattern = path.join("**", pattern);
	logBuild("  " + path.relative(cmd.prefix, path.join(src, pattern)) + " => " + path.relative(cmd.prefix, dest), cmd.verbose);

	files = glob.sync(path.join(src, pattern));
	for (i = 0; i < files.length; i += 1) {
		if (grep && files[i].indexOf(grep) < 0) {
			continue;
		}
		file = path.relative(src, files[i]);
		//logBuild(path.relative(cmd.prefix, files[i]) + " -> " + path.relative(cmd.prefix, path.join(dest, file)));
		if (depth == 1) {
			file = path.join(path.basename(path.dirname(file)), path.basename(file));
		}
		file = path.join(dest, file);
		logBuild(path.relative(cmd.prefix, files[i]) + " -> " + path.relative(cmd.prefix, file));

		wrench.mkdirSyncRecursive(path.dirname(file));
		try{
			fs.writeFileSync(file, fs.readFileSync(files[i]));
		} catch(e) {
			logBuild(e, true);
		}
	}
	return files.length;
};

//
// filters files for exclusion
//
var excludeFilter = function(filename, dir){
	// Shall this file/dir be excluded?
	var i, ignore, doExclude = false;
	if (dir.indexOf("proj.android") >= 0) {
		if (filename === "obj" || filename === "gen" || filename === "assets" || filename === "bin") {
			doExclude = true;
		} else if (dir.indexOf("libs") >= 0) {
			if (filename === "armeabi" || filename === "armeabi-v7a" || filename === "x86" || filename === "mips") {
				doExclude = true;
			}
		}
	} else if (dir.indexOf(".xcodeproj") >= 0) {
		if (filename === "project.xcworkspace" || filename === "xcuserdata") {
			doExclude = true;
		}
	} else if (filename === "lib") {
		try {
			i = fs.lstatSync(path.join(dir, filename));
			if (i.isSymbolicLink()) {
				doExclude = true;
			}
		} catch(e) {
			logBuild(e, true);
		}
	} else if (dir.indexOf(path.join("build", "build")) >= 0) {
		doExclude = true;
	} else if (cmd.engine === "titanium" && filename === "build") {
		doExclude = true;
	} else if (cmd.engine === "unity" && (filename === "Library" || filename === "Temp" || filename.indexOf(".sln") >= 0 || filename.indexOf(".unityproj") >= 0 || filename.indexOf(".userprefs") >= 0)) {
		doExclude = true;
	} else if (filename.substr(0,2) === "._") {
		doExclude = true;
	} else {
		ignore = [
			".DS_Store",
			//"node_modules",
			//"wsocket.c", "wsocket.h",
			//"usocket.c", "usocket.h",
			//"unix.c", "unix.h",
			//"serial.c",
		];
		for (i = 0; i < ignore.length; i += 1) {
			if (filename === ignore[i]) {
				doExclude = true;
				break;
			}
		}
	}

	// Report and return
	if (doExclude) {
		logBuild("Ignoring filename '" + filename + "' in " + dir, cmd.verbose);
	}
	if (!doExclude) {
		copyCount += 1;
	}
	return doExclude;
};

//
// download and extract a url to the given destination
//
var downloadUrl = function(url, dest, cb) {
	// prefix the extract destination
	if (extractName.length) {
		dest = path.join(dest, extractName);
		wrench.mkdirSyncRecursive(dest);
	}
	logBuild("Download destination: " + dest, true);
	
	// now download
	logBuild("Downloading " + url + " please wait...", true);
	var dl = new download({extract: true}).get(url, dest);
	dl.run(function (err, files) {
		if (err) {
			logErr("Download error " + err);
			cb(false);
		} else {
			logBuild("Download + extract finished ", true);
			cb(true);
		}
	});
};

//
// check for upgrade
//
var checkUpdate = function() {
	var req = http.get("http://registry.npmjs.org/rapidgame");
	req.on("response", function(response) {
		var oldVersion = packageJson.version.toString(),
			newVersion = "";
		response.on("data", function(chunk) {
			newVersion += chunk;
		});
		response.on("end", function() {
			try {
				newVersion = JSON.parse(newVersion);
				if (typeof newVersion === "object"
				&& typeof newVersion["dist-tags"] === "object") {
					newVersion = newVersion["dist-tags"]["latest"].toString().trim();
					var n1 = oldVersion.substring(oldVersion.lastIndexOf(".")+1),
						n2 = newVersion.substring(newVersion.lastIndexOf(".")+1);
					if (newVersion !== oldVersion && n1 < n2) {
						console.log("\nAn update is available.");
						console.log("\t" + oldVersion + " -> " + newVersion);
						console.log("Upgrade instructions:");
						if (cmdName.indexOf("pro") >= 0) {
							console.log("\tcd " + __dirname + " && npm update");
						} else {
							console.log("\tsudo npm update " + cmdName + " -g");
						}
						console.log(" ");
					}
				}
			} catch(e) {
			}
		});
	});
	req.on("error", function(){});
}

//
// append to the build log
//
var logBuild = function(str, echo) {
	if (echo) {
		console.log(str);
	}
	if (cmd.buildLog) {
		try {
			fs.appendFileSync(cmd.buildLog, str + "\n");
		} catch(e) {
		}
	}
};

//
// execute a command
//
var exec = function(command, options, callback) {
	// logging
	if (cmd.verbose) {
		console.log("Current dir: " + options.cwd + "\n");
		console.log(command + "\n");
	}
	logBuild("\nCurrent dir:\n\t" + options.cwd + "\n\nExecuting:\n\t" + command + "\n\n");

	// execute
	try {
		child_process.exec(command, options, function(err, stdout, stderr){
			execCallback(err, stdout, stderr);
			callback(err, stdout, stderr);
		});
	} catch(e) {
		logBuild(e, true);
	}
};

//
// child_process.exec callback
//
var execCallback = function(error, stdout, stderr) {
	if (error !== null) {
		logErr("exec error: " + error);
	}
	logBuild(stdout, cmd.verbose || error);
	logBuild(stderr, cmd.verbose || error);
};

//
// execute a streaming command
//
var spawn = function(command, args, options, callback) {
	if (cmd.verbose) {
		console.log("Current dir: " + options.cwd + "\n");
		console.log(command + ' ' + args.join(' ') + "\n");
	}
	logBuild("\nCurrent dir:\n\t" + options.cwd + "\n\nSpawning:\n\t" + command + ' ' + args.join(' ') + "\n\n");

	try {
		// spawn the process
		var child, exitCode = 0;
		if (args && args.length) {
			child = child_process.spawn(command, args, options);
		} else {
			child = child_process.spawn(command, options);
		}

		// watch its output
		child.stdout.on("data", function(chunk) {
			logBuild(chunk.toString(), cmd.verbose);
		});
		child.stderr.on("data", function(chunk) {
			logBuild(chunk.toString(), cmd.verbose);
		});
		child.on("error", function(e) {
			logErr("Spawn error " + e);
			callback(e);
		});

		// close
		child.on("exit", function(code, signal) {
			exitCode = code;
			//if (code != 0 & cmd.verbose) {
			//	console.log("Code: " + code);
			//	console.log("Signal: " + signal);
			//}
		});
		child.on("close", function(code) {
			if (exitCode) {
				callback(exitCode);
			} else {
				callback();
			}
		});
	} catch(e) {
		logErr("Spawn error " + e);
		callback(e);
	}
};

//
// replace occurrences a string with another in a specific file
//
var sed = function(search, replace, dest) {
	logBuild("Replacing all '" + search + "' with '" + replace + "' in: " + dest, cmd.verbose);
	try{
		var text = fs.readFileSync(dest).toString(),
			pos = 0;
		do {
			pos = text.indexOf(search);
			if (pos >= 0) {
				text = text.substr(0,pos) +
					replace +
					text.substr(pos + search.length);
			}
		} while(pos >= 0);
		fs.writeFileSync(dest, text);
	} catch(e) {
		logBuild(e, true);
	}
}

//
// log an error
//
var logErr = function(str) {
	console.log(str);
	logReport("error", str);
};

//
// Test if a directory exists
//
var dirExists = function(path) {
	var stat;
	try {
		stat = fs.statSync(path);
	} catch(e) {
	}
	return (stat && stat.isDirectory());
};

//
// Test if a file exists
//
var fileExists = function(path) {
	var stat;
	try {
		stat = fs.statSync(path);
	} catch(e) {
	}
	return (stat && stat.isFile());
};

//
// tests if a directory is writeable
//
var isWriteableDir = function(dir) {
	try {
		dir = path.join(dir, ".testfile");
		fs.writeFileSync(dir, "test");
		fs.unlinkSync(dir);
		return true;
	} catch(e) {
	}
	return false;
};

//
// reporting feature no longer used 
//
var logReport = (function() {
	return function(action, label, value, path) {
		return;
	}
}());

//
// show usage instructions
//
var usage = function() {
	cmd.help();
	usageExamples();
};
var usageExamples = function() {
	console.log("  Available:\n");
	console.log("    Engines:               " + engines.join(", "));
	console.log("    Platforms:             all (default), " + platforms.join(", "));
	console.log("    Templates:             " + templates.join(", "));
	console.log("");
	console.log("  Examples:\n");
	console.log("    " + cmdName + " create cocos2dx \"HeckYeah\" com.mycompany.heckyeah");
	console.log("");
};

module.exports = {
	run: run,
	version: version
};

//
//  To-do:
//   - Skip release build for iphonesimulator.
//   - Fix Mac project name search and replace so names with spaces work. (It used to...)
//   - Finish orientation option:
//		.option("-o, --orientation <orientation>", "orientation (" + orientations.join(", ") + ") [" + defaults.orientation + "]", defaults.orientation)
//   - Consider calling android/strip on copied *.a
//


