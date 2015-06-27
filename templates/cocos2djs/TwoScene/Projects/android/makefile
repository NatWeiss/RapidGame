# build_files.py: updates the source file list under `Projects` in `Projects/android/jni/Android.mk` (uses makeignore)
# build_native.py: compiles and links all the source files in Android.mk with cocos2d-x to create a shared library
# ant: adds the shared library and assets together to build an .apk
# adb install: installs an .apk onto the specified device
# adb logcat: specifies what kind of log information to output to the console

SHELL=/bin/bash
PLUGIN_DIR=$$(cd ../../lib/cocos2d/x/java && pwd)

all:
	@echo "ANDROID_SDK_ROOT=${ANDROID_SDK_ROOT}"
	@echo "PLUGIN_DIR=${PLUGIN_DIR}"
	@if [ ! -d ${ANDROID_SDK_ROOT} ]; then echo "WARNING: The ANDROID_SDK_ROOT environment variable does not point to a directory. See the Readme.txt and set ANDROID_SDK_ROOT in your .profile."; exit; fi
	./build_files.py
	export CONFIG="debug" && ./build_native.py
	find . -name .DS_Store -delete
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} debug
release:
	./build_files.py
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} debug
distribution:
	./build_files.py
	export CONFIG="release" && ./build_native.py
	ant -Dsdk.dir=${ANDROID_SDK_ROOT} -Dplugin.dir=${PLUGIN_DIR} release
	zipalign -f 4 bin/`cat .name`-release-unsigned.apk bin/`cat .name`-release-aligned.apk
run:
	adb -d install -r bin/`cat .name`-debug.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
run-release:
	adb -d install -r bin/`cat .name`-debug.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
run-distribution:
	adb -d install -r bin/`cat .name`-release-aligned.apk
	adb -d logcat -v brief `cat .identifier`:D *:F
start-emulator:
	#emulator -avd [device_name]
run-emulator:
	#adb -e install -r bin/`cat .name`-debug.apk
	#adb -e logcat -v brief `cat .identifier`:D *:F
clean:
	rm -rf obj
	rm -rf bin
	rm -rf gen
	rm -rf assets
	rm -rf libs
