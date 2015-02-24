SHELL=/bin/bash
PLUGIN_DIR=$$(cd ../../lib/cocos2d/x/java && pwd)

all:
	@echo "ANDROID_HOME=${ANDROID_HOME}"
	@echo "PLUGIN_DIR=${PLUGIN_DIR}"
	@if [ ! -d ${ANDROID_HOME} ]; then echo "WARNING: The ANDROID_HOME environment variable does not point to a directory. See the Readme.txt and set ANDROID_HOME in your .profile."; exit; fi
	export CONFIG="debug" && ./build_native.py
	find . -name .DS_Store -delete
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} debug
release:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} debug
distribution:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_HOME} -Dplugin.dir=${PLUGIN_DIR} release
	zipalign -f 4 bin/`cat .name`-release-unsigned.apk bin/`cat .name`-release-aligned.apk
start-emulator:
	android avd
run-emulator:
	adb -e install bin/`cat .name`-debug.apk
	adb -e logcat -s
	adb -e logcat -v raw
run:
	#adb -d uninstall `cat .identifier`
	adb -d install -r bin/`cat .name`-debug.apk
	#adb -d logcat -s
	echo
	adb -d logcat -v raw *:d
run-release:
	#adb -d uninstall `cat .identifier`
	adb -d install bin/`cat .name`-debug.apk
	#adb -d logcat -s
	adb -d logcat -v raw *:d
run-distribution:
	#adb -d uninstall `cat .identifier`
	adb -d install bin/`cat .name`-release-aligned.apk
	#adb -d logcat -s
	adb -d logcat -v raw *:d
clean:
	rm -rf obj
	rm -rf bin
	rm -rf gen
	rm -rf assets
	rm -rf libs/armeabi
	rm -rf libs/armeabi-v7a
	rm -rf libs/x86
	rm -rf libs/mips
