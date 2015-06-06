SHELL=/bin/bash
PLUGIN_DIR=$$(cd ../../lib/cocos2d/x/java && pwd)

all:
	@echo "ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"
	@echo "PLUGIN_DIR=${PLUGIN_DIR}"
	@if [ ! -d ${ANDROID_SDK_ROOT} ]; then echo "WARNING: The ANDROID_SDK_ROOT environment variable does not point to a directory. See the Readme.txt and set ANDROID_SDK_ROOT in your .profile."; exit; fi
	export CONFIG="debug" && ./build_native.py
	find . -name .DS_Store -delete
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} debug
release:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} debug
distribution:
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} release
	zipalign -f 4 bin/`cat .name`-release-unsigned.apk bin/`cat .name`-release-aligned.apk
start-emulator:
	#emulator -avd [device_name]
run-emulator:
	#adb -e install -r bin/`cat .name`-debug.apk
	#adb -e logcat -v brief `cat .identifier`:D *:F
run:
	adb -d install -r bin/`cat .name`-debug.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
run-release:
	adb -d install -r bin/`cat .name`-debug.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
run-distribution:
	adb -d install -r bin/`cat .name`-release-aligned.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
clean:
	rm -rf obj
	rm -rf bin
	rm -rf gen
	rm -rf assets
	rm -rf libs
