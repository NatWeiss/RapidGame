//
//  Part of the [RapidGame](https://github.com/natweiss/rapidgame) project.
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nathanael Weiss.
//
//  To-do:
//   - Mention how to use a manual download of cocos2d-js.
//   - Fix Mac project name search and replace so names with spaces work.
//   - Fix Mac temp dir if changed to relative to project
//   - Why did `sudo npm unlink rapidgame -g; sudo npm link .` fix "Error: Cannot find module 'path-extra'"?
//

var http = require("http"),
	path = require("path-extra"),
	fs = require("fs"),
	util = require("util"),
	cmd = require("commander"),
	replace = require("replace"),
	download = require("download"),
	glob = require("glob"),
	wrench = require("wrench"),
	child_process = require("child_process"),
	packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "package.json"))),
	cmdName = packageJson.name,
	version = packageJson.version,
	cocos2djsUrlMac = "http://cdn.cocos2d-x.org/cocos2d-js-v3.6.zip", // also, http://www.cocos2d-x.org/filedown/cocos2d-js-v3.6.zip
	cocos2djsUrlWin = "http://cdn.cocos2d-x.org/cocos2d-js-v3.6.zip",
	cocos2djsUrl = (process.platform === "darwin" ? cocos2djsUrlMac : cocos2djsUrlWin),
	cocos2dDirGlob = "*ocos2d-js*",
	category,
	engines = [],
	templates = [],
	builds = [],
	orientations = ["landscape", "portrait"],
	platforms = ["headers", "ios", "mac", "android", "windows", "linux"],
	copyCount = 0,
	msBuildPath,
	defaults = {
		engine: "cocos2dx",
		template: "TwoScene",
		package: "org.mycompany.mygame",
		dest: process.cwd(),
		prefix: __dirname,
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
		.option("-t, --template <name>", "template (" + templates.join(", ") + ") [" + defaults.template + "]", defaults.template)
		.option("-p, --prefix <name>", "library directory [" + defaults.prefix + "]", defaults.prefix)
		.option("-f, --folder <path>", "output folder [" + defaults.dest + "]", defaults.dest)
		.option("-o, --orientation <orientation>", "orientation (" + orientations.join(", ") + ") [" + defaults.orientation + "]", defaults.orientation)
		.option("--nostrip", "do not strip the prebuilt libraries", false)
		.option("--minimal", "prebuild only debug libraries and use minimal architectures", false)
		.option("-v, --verbose", "be verbose", false);

	cmd
		.command("create <engine> <project-name> <package-name>")
		.description("     Create a new cross-platform game project [engines: " + engines.join(", ") + "]")
		.action(createProject);
	commands.push("create");

	cmd
		.command("prebuild [platform]")
		.description("                            Prebuild cocos2d-x static libraries [platforms: " + platforms.join(", ") + "]")
		.action(prebuild);
	commands.push("prebuild");

	cmd
		.command("init <directory>")
		.description("                            Create a symlink in the given directory to the libraries")
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
// Initialize the given directory.
//
var init = function(directory) {
	var src, dest;

	if (!checkPrefix()) {
		usage();
		return 1;
	}
	if (!dirExists(directory)) {
		console.log("Output directory must exist: " + directory);
		return 1;
	}

	// Create lib symlink
	// Windows: If you get Error: EPERM: operation not permitted: 'folder name\lib' it probably means you need to Run As Administrator
	src = path.join(cmd.prefix, version);
	dest = path.join(directory, "lib");
	console.log("Symlinking" + (cmd.verbose ? ": " + dest + " -> " + src : " lib folder"));
	try {
		fs.symlinkSync(src, dest);
	} catch(e) {
		logErr("Error creating symlink: " + e);
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
	
	category = "createProject";
	
	if (!checkPrefix()) {
		usage();
		return 1;
	}
	
	// Check engine and name
	if (!cmd.engine || !name || !package) {
		console.log("Engine, project name and package name are required, for example: " + cmdName + " cocos2dx \"Heck Yeah\" com.mycompany.heckyeah");
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
	report("start", cmd.engine + "/" + cmd.template);
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
		report("done");
		
		// Auto prebuild
		if (isCocos2d && !dirExists(path.join(cmd.prefix, version))) {
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
	category = "prebuild";
	platform = (platform || "");
	platform = platform.toString().toLowerCase();
	config = config || "";
	arch = arch || "";
	if (platforms.indexOf(platform) < 0) {
		platform = "";
	}

	if (!checkPrefix()) {
		usage();
		return 1;
	}

	console.log("Happily prebuilding " + platform);
	cmd.buildLog = path.join(cmd.prefix, "build.log");
	try {
		fs.writeFileSync(cmd.buildLog, "");
		console.log("Writing build log to: " + cmd.buildLog);
	} catch(e) {
		cmd.buildLog = "";
	}

	report("start");
	copySrcFiles(function() {
		downloadCocos(function() {
			setupPrebuild(platform, function() {
				runPrebuild(platform, config, arch, function() {
					report("done");
				});
			});
		});
	});
};

//
// copy src directory to prefix
//
var copySrcFiles = function(callback) {
	var src, dest;

	// Synchronously copy src directory to dest
	src = path.join(__dirname, "src");
	dest = path.join(cmd.prefix, "src");
	if (src !== dest) {
		console.log("Copying " + src + " to " + dest);
		copyRecursive(src, dest, true);
	}

	callback();
};

//
// download cocos2d js source
//
var downloadCocos = function(callback) {
	var dir = path.join(cmd.prefix, "src"),
		src,
		dest = path.join(dir, "cocos2d-js"),
		downloaded = path.join(cmd.prefix, "src", "downloaded.txt"),
		doDownload = !dirExists(dest),
		ver;

	// check downloaded version
	try{
		ver = fs.readFileSync(downloaded).toString().trim();
	} catch(e) {
	}
	if (ver !== cocos2djsUrl) {
		if (typeof ver !== "undefined") {
			console.log("Current Cocos2D JS URL: " + cocos2djsUrl);
			console.log("Downloaded Cocos2D JS URL: " + ver);
			console.log("Re-downloading");
		}
		doDownload = true;
		try {
			wrench.rmdirSyncRecursive(dest, true);
		} catch(e) {
			if (cmd.verbose) {
				console.log(e);
			}
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
		console.log("WARNING: Directory " + src + " may prevent cocos2d-js from being patched with git apply");
	}
	
	// copy latest patch
	copyGlobbed(path.join(__dirname, "src"), dir, "*.patch");

	// download
	downloadUrl(cocos2djsUrl, dir, function(success) {
		if (!success) {
			return;
		}

		var globPath = path.join(dir, cocos2dDirGlob),
			files = glob.sync(globPath);
		if (!files || files.length !== 1) {
			logErr("Couldn't glob " + globPath);
			return;
		}

		// Rename extract dir
		try {
			console.log("Moving " + files[0] + " to " + dest);
			fs.renameSync(files[0], dest);

			// Save downloaded version
			fs.writeFileSync(downloaded, cocos2djsUrl);

			// Apply latest patch
			// (see comments at the end of this file for how to create the patch)
			src = path.join(dir, "cocos2d.patch");
			console.log("Applying patch file: " + src);
			exec("git apply --whitespace=nowarn " + src, {cwd: dest, env: process.env}, function(err){
				// Delete patch
				//if (!err) {
				//	fs.unlinkSync(src);
				//}
				
				callback();
			});
		} catch(e) {
			logErr("Couldn't move " + files[0] + " to " + dest)
		}
	});
};

//
// prebuild setup (copies headers, java files, etc.)
//
var setupPrebuild = function(platform, callback) {
	var ver, dir, src, dest, i, files,
		frameworks = path.join(cmd.prefix, "src", "cocos2d-js", "frameworks");

	if (platform && platform !== "headers") {
		callback();
		return;
	}

	console.log("Copying header files...");

	// reset cocos2d dir
	ver = path.join(cmd.prefix, version);
	dest = path.join(ver, "cocos2d");
	files = ["html", path.join("x", "include"), path.join("x", "java"), path.join("x", "script")];
	try {
		for (i = 0; i < files.length; i += 1) {
			src = path.join(dest, files[i]);
			if (cmd.verbose) {
				console.log("rm -r " + src);
			}
			wrench.rmdirSyncRecursive(src, true);
			if (cmd.verbose) {
				console.log("mkdir " + src);
			}
			wrench.mkdirSyncRecursive(src);
		}
	} catch(e) {
		console.log("Error cleaning destination: " + dest);
		if (cmd.verbose) {
			console.log(e);
		}
	}

	// copy cocos2d-html5
	dest = path.join(ver, "cocos2d", "html");
	src = path.join(frameworks, "cocos2d-html5");
	copyRecursive(src, dest, false, true);

	// copy headers
	dir = dest = path.join(ver, "cocos2d", "x", "include");
	src = path.join(frameworks, "js-bindings", "cocos2d-x");
	// # except if dir is cocos2d-x/plugin (or don't copy plugin/jsbindings and reference the one in include/plugin/jsbindings)
	copyGlobbed(src, dest, '*.h');
	copyGlobbed(src, dest, '*.hpp');
	copyGlobbed(src, dest, '*.msg');
	copyGlobbed(src, dest, '*.inl');

	dest = path.join(dir, "bindings");
	src = path.join(frameworks, "js-bindings", "bindings");
	copyGlobbed(src, dest, '*.h');
	copyGlobbed(src, dest, '*.hpp');

	dest = path.join(dir, "external");
	src = path.join(frameworks, "js-bindings", "external");
	copyGlobbed(src, dest, '*.h');
	copyGlobbed(src, dest, '*.msg');


	// remove unneeded
	files = ["docs", "build", "tests", "samples", "templates", "tools",
		path.join("plugin", "samples"), path.join("plugin", "plugins"), path.join("extensions", "proj.win32")];
	for (i = 0; i < files.length; i += 1) {
		wrench.rmdirSyncRecursive(path.join(dir, files[i]), true);
	}

	// jsb
	dest = path.join(ver, "cocos2d", "x", "script");
	src = path.join(frameworks, "js-bindings", "bindings", "script");
	copyGlobbed(src, dest, '*.js');
	src = path.join(frameworks, "js-bindings", "bindings", "auto", "api");
	copyGlobbed(src, dest, '*.js');

	// java
	dir = path.join(ver, "cocos2d", "x", "java");
	dest = path.join(dir, "cocos2d-x");
	src = path.join(frameworks, "js-bindings", "cocos2d-x", "cocos", "platform", "android", "java");
	copyRecursive(src, dest);
	// .mk and .a
	dest = path.join(dir, "mk");
	src = path.join(cmd.prefix, "src");
	copyGlobbed(src, dest, "*.mk");
	copyGlobbed(src, dest, "*.a", "android");
	src = path.join(frameworks, "js-bindings");
	copyGlobbed(src, dest, "*.mk");
	copyGlobbed(src, dest, "*.a", "android");
	// # bonus: call android/strip on mk/*.a
	files = ["proj.android", "cocos2d-js"];
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

	// symlink latest -> version
	dest = path.join(cmd.prefix, "latest");
	try {fs.unlinkSync(dest);} catch(e){}
	try {fs.symlinkSync(version, dest/*, "dir"*/);} catch(e){}

	callback();
};

//
// run the prebuild command
//
var runPrebuild = function(platform, config, arch, callback) {
	config = "";
	arch = "";
	if (platform === "headers") {
		callback();
	} else if (process.platform === "darwin") {
		if (platform === "ios") {
			prebuildMac("iOS", config, arch, function(){
				callback();
			});
		} else if (platform === "mac") {
			prebuildMac("Mac", config, arch, function(){
				callback();
			});
		} else if (platform === "android") {
			prebuildAndroid(config, arch, function(){
				callback();
			});
		} else {
			prebuildMac("Mac", config, arch, function(){
				prebuildMac("iOS", config, arch, function(){
					prebuildAndroid(config, arch, function(){
						callback();
					});
				});
			});
		}
	} else if (process.platform === "win32") {
		prebuildWin(config, arch, callback);
	} else {
		console.log("No prebuild command written for " + process.platform + " yet");
	}
};

//
// prebuild mac
//
var prebuildMac = function(platform, config, arch, callback) {
	var i, j, k,
		sdks = (platform === "Mac" ? ["macosx"] : ["iphoneos", "iphonesimulator"]),
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"])),
		projs = ["cocos2dx-prebuilt"];

	// create builds array
	builds = [];
	for (i = 0; i < configs.length; i += 1) {
		for (j = 0; j < sdks.length; j += 1) {
			for (k = 0; k < projs.length; k += 1) {
				builds.push([configs[i], sdks[j], projs[k]]);
			}
		}
	}
	nextBuild(platform, callback);
};

//
// prebuild android
//
var prebuildAndroid = function(config, arch, callback) {
	var i, j,
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"])),
		archs = (cmd.minimal ? ["armeabi"] : ["armeabi", "armeabi-v7a", "x86"]);

	// create builds array
	builds = [];
	for (i = 0; i < configs.length; i += 1) {
		for (j = 0; j < archs.length; j += 1) {
			builds.push([configs[i], archs[j]]);
		}
	}
	nextBuild("Android", callback);
};

//
// prebuild windows
//
var prebuildWin = function(config, arch, callback) {
	var i, j, command, targets, args, projs,
		jsbindings = path.join(cmd.prefix, "src", "cocos2d-js", "frameworks", "js-bindings"),
		configs = (config ? [config] : (cmd.minimal ? ["Debug"] : ["Debug", "Release"]));

	// set VCTargetsPath
	// (overcome error MSB4019: The imported project "C:\Microsoft.Cpp.Default.props" was not found.)
	process.env["VCTargetsPath"] = getVCTargetsPath();

	// get bindings projects
	projs = glob.sync(path.join(jsbindings, "bindings", "proj.win32", "*.vcxproj")) || [];

	getMSBuildPath(function(_msBuildPath) {
		msBuildPath = _msBuildPath;

		// create builds
		builds = [];
		for (i = 0; i < configs.length; i += 1) {
			command = path.join(msBuildPath, "MSBuild.exe");
			targets = ["libcocos2d", "libBox2D", "libSpine"];
			args = [
				path.join(jsbindings, "cocos2d-x", "build", "cocos2d-win32.vc2012.sln"),
				"/nologo",
				"/maxcpucount:4",
				//"/t:" + targets.join(";"),
				//"/p:VisualStudioVersion=12.0",
				//"/p:PlatformTarget=x86",
				//"/verbosity:diag",
				//"/clp:ErrorsOnly",
				//"/p:nowarn=4005",
				//'/p:WarningLevel=0',
				"/p:configuration=" + configs[i]
			];

			// main solution
			builds.push([configs[i], command, args]);

			// bindings
			for (j = 0; j < projs.length; j+=1) {
				args = [
					projs[j],
					"/nologo",
		            "/maxcpucount:4",
		        	"/p:configuration=" + configs[i]
				];
				builds.push([configs[i], command, args, (j == projs.length - 1) ? linkWin : false]);
			}
		}

		// start
		nextBuild("Windows", callback);
	});
};

//
// launch the next build
//
var nextBuild = function(platform, callback){
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
	var dir, command, args, config, sdk, proj, arch, targets, archSettings = [], xcodeSettings = [];
	if (platform === "iOS" || platform === "Mac") {
		config = settings[0];
		sdk = settings[1];
		proj = settings[2];
		command = "xcodebuild";
		dir = path.join(cmd.prefix, "src", "proj.ios_mac");
		xcodeSettings = ["GCC_SYMBOLS_PRIVATE_EXTERN=NO"];
		if (!cmd.nostrip) {
			xcodeSettings.push("DEPLOYMENT_POSTPROCESSING=YES");
			xcodeSettings.push("STRIP_INSTALLED_PRODUCT=YES");
			xcodeSettings.push("STRIP_STYLE=non-global");
		}
		if (cmd.minimal) {
			archSettings = (sdk === "iphoneos" ? ["-arch", "armv7"] : ["-arch", "i386"]);
		}
		args = [
			"-project", path.join(dir, proj + ".xcodeproj"),
			"-scheme", platform,
			"-configuration", config,
			"-sdk", sdk
		];
		args = args.concat(archSettings);
		args = args.concat(xcodeSettings);
	} else if (platform === "Android") {
		dir = path.join(cmd.prefix, "src", "proj.android");
		command = path.join(dir, "build.sh");
		config = settings[0];
		arch = settings[1];
		args = [
			arch,
			config
		];
	} else if (platform === "Windows") {
		dir = cmd.prefix;
		command = settings[1];
		args = settings[2];
		settings[1] = "";
		settings[2] = path.basename(args[0]);
	}

	console.log("Building " + platform + " " + settings[0] +
		(settings[1] ? " " + settings[1] : "") +
		(settings[2] ? " " + settings[2] : "") + "...");
	spawn(command, args, {cwd: dir, env: process.env}, function(err){
		var onFinished = function(){
			console.log("Succeeded.");
			nextBuild(platform, callback);
		};
		if (!err){
			if (typeof settings[3] === "function") {
				settings[3](settings[0], onFinished);
			} else {
				onFinished();
			}
		} else {
			if (!cmd.verbose) {
				console.log("Build failed. Please run with --verbose or check the build log: " + cmd.buildLog);
			}
		}
	});
};

//
// link windows
//
var linkWin = function(config, callback) {
	var i, src,
		jsbindings = path.join(cmd.prefix, "src", "cocos2d-js", "frameworks", "js-bindings"),
		libDirs = [
			path.join(jsbindings, "cocos2d-x", "build", config + ".win32"),
			path.join(jsbindings, "cocos2d-x", "cocos", "2d", config + ".win32"),
			path.join(jsbindings, "bindings", "proj.win32", config + ".win32"),
			path.join(jsbindings, "cocos2d-x", "cocos", "editor-support", "spine", "proj.win32", config + ".win32"),
			path.join(jsbindings, "cocos2d-x", "external", "Box2D", "proj.win32", config + ".win32"),
			path.join(jsbindings, "external", "spidermonkey", "prebuilt", "win32"),
			path.join(jsbindings, "cocos2d-x", "external", "websockets", "prebuilt", "win32")
		],
		options = {
			cwd: cmd.prefix,
			env: process.env
		},
		dest = path.join(cmd.prefix, version, "cocos2d", "x", "lib", config + "-win32", "x86"),
		command = '"' + getVCBinDir() + 'lib.exe" ' +
			'/NOLOGO ' +
			'/IGNORE:4006 ' +
			//'/OPT:REF ' +
			//'/OPT:ICF ' +
			'"/OUT:' + path.join(dest, "libcocos2dx-prebuilt.lib") + '"';

	// copy dlls and finish creating command
	wrench.mkdirSyncRecursive(dest);
	for (i = 0; i < libDirs.length; i += 1) {
		copyGlobbed(libDirs[i], dest, "*.dll");
		//copyGlobbed(libDirs[i], dest, "*.pdb");
		command += " " + path.join(libDirs[i], "*.lib");
	}
	copyGlobbed(path.join(cmd.prefix, "src", "cocos2d-js", "templates", "js-template-runtime", "runtime", "win32"), dest, "*.dll");

	// execute
	exec(command, options, function(err){
		if (!err) {
			callback();
		} else {
			console.log(err);
		}
	});
};

//
// get the ms build tools path
//
var getMSBuildPath = function(callback) {
	var Winreg = require("winreg"),
		root = '\\Software\\Microsoft\\MSBuild\\ToolsVersions',
		regKey = new Winreg({key: root});
	regKey.keys(function (err, items) {
		var i, key, highest = 0, buildPath = '', count = 0;
		if (err) {
			console.log(err);
			return;
		}
		
		// find path to MSBuildToolsPath
		for (i = 0; i < items.length; i += 1) {
			key = path.basename(items[i].key);
			regKey = new Winreg({key: root + '\\' + key});	
			(function(key){
				regKey.get("MSBuildToolsPath", function(err, item) {
					count += 1;
					if (err) {
						console.log(err);
					} else if (typeof item === "object" && typeof item.value === "string" && item.value.length) {
						if (cmd.verbose) {
							console.log("Potential MSBuildToolsPath: " + item.value);
						}
						console.log("Checking version = " + parseFloat(key) + " against highest " + highest);
						if (parseFloat(key) > highest) {
							buildPath = item.value;
							highest = parseFloat(key);
						}
					}
					if (count === items.length) {
						if (buildPath.length) {
							console.log("Final MSBuildToolsPath: " + buildPath);
							callback(buildPath);
						} else {
							console.log("Unable to find MSBuild path");
						}
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
var getVCTargetsPath = function() {
	var i,
		ret,
		bases = [
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\V120\\",
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\V110\\",
			"\\MSBuild\\Microsoft.Cpp\\v4.0\\"
		],
		names = [
			"\\Program Files (x86)",
			"C:\\Program Files (x86)",
			"\\Program Files",
			"C:\\Program Files"
		];
	for (j = 0; j < bases.length; j += 1) {
		for (i = 0; i < names.length; i += 1) {
			ret = names[i] + bases[j];
			if (dirExists(ret)) {
				if (cmd.verbose) {
					console.log("VCTargetsPath: " + ret);
				}
				return ret;
			}
		}
	}
};

//
// get the vc bin dir
// todo: mine this from the registry
// mimic python's find_vcvarsall
// http://stackoverflow.com/questions/6551724/how-do-i-point-easy-install-to-vcvarsall-bat
// or:
// http://cmake.3232098.n2.nabble.com/How-to-find-vcvarsall-bat-e-g-at-quot-C-Program-Files-x86-Microsoft-Visual-Studio-12-0-VC-quot-CMAKE-td7587359.html
//
var getVCBinDir = function() {
	var i,
		base = "\\Microsoft Visual Studio 12.0\\VC\\bin\\",
		names = [
			"\\Program Files (x86)" + base,
			"C:\\Program Files (x86)" + base,
			"\\Program Files" + base,
			"C:\\Program Files" + base
		];
	for (i = 0; i < names.length; i += 1) {
		if (dirExists(names[i])) {
			if (cmd.verbose) {
				console.log("VCBinDir: " + names[i]);
			}
			return names[i];
		}
	}
	return "";
};

//
// check that prefix directory is writeable
//
var checkPrefix = function() {
	// Test prefix dir
	if (!isWriteableDir(cmd.prefix)) {
		if (cmd.prefix !== defaults.prefix) {
			logErr("Cannot write files to prefix directory: " + cmd.prefix);
			return false;
		}

		// Try users's home dir if they didn't override the prefix setting
		var newPrefix = path.join(path.homedir(), "Library", "Developer", "RapidGame");
		wrench.mkdirSyncRecursive(newPrefix);
		if (!isWriteableDir(newPrefix)) {
			logErr("Cannot write files to alternate prefix directory: " + newPrefix);
			return false;
		}
		cmd.prefix = newPrefix;
	}
	if (cmd.verbose) {
		console.log("Can successfully write files to prefix directory: " + cmd.prefix);
	}
	return true;
};

//
// Copy files recursively with a special exclude filter.
//
var copyRecursive = function(src, dest, filter, overwrite) {
	if (cmd.verbose) {
		console.log("Recursively copying " + path.relative(cmd.prefix, src) +
			" to " + path.relative(cmd.prefix, dest));
	}
	
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
var copyGlobbed = function(src, dest, pattern, grep) {
	var i, file, files;
	pattern = path.join("**", pattern);
	if (cmd.verbose) {
		console.log("Recursively copying " + path.relative(cmd.prefix, path.join(src, pattern)) +
			" to " + path.relative(cmd.prefix, dest));
	}

	files = glob.sync(path.join(src, pattern));
	for (i = 0; i < files.length; i += 1) {
		if (grep && files[i].indexOf(grep) < 0) {
			continue;
		}
		file = path.join(dest, path.relative(src, files[i]));
		//console.log(/*path.relative(cmd.prefix, files[i]) + " -> " + */path.relative(cmd.prefix, file));
		wrench.mkdirSyncRecursive(path.dirname(file));
		try{
			fs.writeFileSync(file, fs.readFileSync(files[i]));
		} catch(e) {
			console.log(e);
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
			console.log(e);
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
	if (doExclude && cmd.verbose) {
		console.log("Ignoring filename '" + filename + "' in " + dir);
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
	var done = false,
		total = 1,
		cur = 0,
		emitter = download(url, dest, {extract: true});

	// Get total length
	emitter.on("response", function(response) {
		total = parseInt(response.headers["content-length"], 10)
	});
	
	// Update percentage
	if (process.platform == "win32") {
		console.log("Downloading " + url + "...");
	} else {
		emitter.on("data", function(chunk) {
			if (!done) {
				cur += chunk.length;
				done = (cur >= total);
				util.print("Downloading " + url + " "
					+ (100.0 * cur / total).toFixed(2) + "%..."
					+ (done ? "\n" : "\r"));
			}
		});
	}
	
	// Error
	emitter.on("error", function(status) {
		logErr("Download error " + status);
		cb(false);
	});
	
	// Done
	emitter.on("close", function() {
		console.log("Download + extract finished");
		cb(true);
	});
};

//
// auto bug reporting and insights
//
var report = (function() {
	var ua = require("universal-analytics"),
		visitor;
	
	// Get visitor
	var getVisitor = function() {
		var uuid,
			filename = path.join(cmd.prefix, ".id");

		// Read UUID
		try {
			uuid = fs.readFileSync(filename).toString();
		} catch(e) {
		}
		if (uuid && uuid.indexOf("false") >= 0) {
			console.log("Opted out of automatic bug reporting");
			return null;
		}
	
		// Generate UUID
		if (!uuid || uuid.length < 32 || uuid.indexOf("-") < 0) {
			console.log("");
			console.log("  This tool automatically reports bugs & anonymous usage statistics.");
			console.log("  You may opt-out of this feature by setting contents of the file '" + filename + "' to 'false'.");
			console.log("");
			uuid = require("node-uuid").v4();
			try {
				fs.writeFileSync(filename, uuid);
			} catch(e) {
			}
		}
		//console.log("UUID: " + uuid);
		return ua("UA-597335-12", uuid);
	};

	return function(action, label, value, path) {
		if (typeof visitor === "undefined") {
			visitor = getVisitor();
		}
		if (visitor === null) {
			return;
		}

		category = category || "unknownCategory";
		action = action || "unknownAction";
		label = label || "";
		value = value || 0;
		path = path || (category + "/" + action);
		label.trim();
		
		//console.log("Report " + path + (label ? ": " + label : ""));
		visitor.event(category, action, label, value, {p: path}, function (err) {
		});
	}
}());

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
// show usage instructions
//
var usage = function() {
	cmd.help();
	usageExamples();
};
var usageExamples = function() {
	console.log("  Examples:");
	console.log("");
	console.log("    $ " + cmdName + " create unity \"Zombie Matrix\" com.mycompany.zombiematrix");
	console.log("    $ " + cmdName + " create cocos2dx \"Heck Yeah\" com.mycompany.heckyeah");
	console.log("    $ " + cmdName + " prebuild");
	console.log("");
};

//
// append to the build log
//
var logBuild = function(str) {
	if (cmd.buildLog) {
		try {
			fs.appendFileSync(cmd.buildLog, str);
		} catch(e) {
		}
	}
};

//
// execute a command
//
var exec = function(command, options, callback) {
	if (cmd.verbose) {
		console.log(command);
		console.log("Current dir: " + options.cwd);
	}
	try {
		child_process.exec(command, options, function(err, stdout, stderr){
			execCallback(err, stdout, stderr);
			callback(err, stdout, stderr);
		});
	} catch(e) {
		console.log(e);
	}
};

//
// child_process.exec callback
//
var execCallback = function(error, stdout, stderr) {
	if (error !== null) {
		logErr("exec error: " + error);
	}
	if (cmd.verbose || error) {
		console.log(stdout);
		console.log(stderr);
	}
	logBuild(stdout);
	logBuild(stderr);
};

//
// execute a streaming command
//
var spawn = function(command, args, options, callback) {
	if (cmd.verbose) {
		console.log(command + ' ' + args.join(' '));
		console.log("Current dir: " + options.cwd);
	}
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
			if (cmd.verbose) {
				util.print(chunk.toString());
			}
			logBuild(chunk.toString());
		});
		child.stderr.on("data", function(chunk) {
			if (cmd.verbose) {
				util.print(chunk.toString());
			}
			logBuild(chunk.toString());
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
	if (cmd.verbose) {
		console.log("Replacing all '" + search + "' with '" + replace + "' in: " + dest);
	}
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
		console.log(e);
	}
}

//
// log an error
//
var logErr = function(str) {
	console.log(str);
	report("error", str);
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

module.exports = {
	run: run,
	version: version
};


/*

To make a Cocos2d patch:

	cd /tmp
	cp -r ~/path/to/cocos2d-js-latest .
	cd cocos2d-js-latest
	find . -name .gitignore -delete
	git init .
	git add *
	git commit -a
	cp -r ~/path/to/cocos2d-js-patched/* .
	git diff > patch
	git diff --staged --binary >> patch

	# (it may be possible without git add; try git help diff)

To apply:

	cd cocos2d-js-somewhere
	git apply --whitespace=nowarn patch

*/
