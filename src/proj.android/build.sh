#!/bin/bash

# Directory of script
PWD=$(dirname "$0")
cd $PWD

# Build settings
APP_PLATFORM="android-18"
if [ "$1" == "armeabi" ] || [ "$1" == "armeabi-v7a" ] || [ "$1" == "x86" ]; then
	arch="$1"
else
	arch="armeabi"
fi
if [ "$2" == "release" ] || [ "$2" == "Release" ]; then
	config="Release"
else
	config="Debug"
fi
echo "PLATFORM=${APP_PLATFORM}"
echo "ARCH=${arch}"
echo "CONFIG=${config}"

# Get number of CPU cores
CORES=${NUMBER_OF_PROCESSORS}
if [ -z "$CORES" ]; then
	CORES=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || sysctl -n hw.ncpu)
fi
if [ -z "$CORES" ]; then
	CORES=1
fi
echo "CORES=$CORES"

# Check for NDK_ROOT
if [ ! -d "${NDK_ROOT}" ]; then
	echo "Please set the NDK_ROOT environment variable."
	exit 1
fi

# Check for ANDROID_SDK_ROOT
#if [ ! -d "${ANDROID_SDK_ROOT}" ]; then
#	echo "Please set the ANDROID_SDK_ROOT environment variable."
#	exit 1
#fi

# Set module path
CC_ROOT=$(cd ../cocos2d-js/frameworks/js-bindings && pwd)
SRC_ROOT=$(cd .. && pwd)
UNAME=$(uname -s)

# Sam: cygwin wants colon separators just like everyone else
NDK_MODULE_PATH="${CC_ROOT}/cocos2d-x:${CC_ROOT}/cocos2d-x/external:${CC_ROOT}/cocos2d-x/cocos:${CC_ROOT}:${SRC_ROOT}"

echo "CC_ROOT=${CC_ROOT}"
echo "NDK_MODULE_PATH=${NDK_MODULE_PATH}"

# Set NDK_TOOLCHAIN_VERSION
# Sam: NDK Toolchain Version 4.9 is now out (NDK r10e)
if [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.8" ]; then
	export NDK_TOOLCHAIN_VERSION="4.8"
elif [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.7" ]; then
	export NDK_TOOLCHAIN_VERSION="4.7"
else
	echo "NDK toolchain version 4.8 or 4.7 is required."
	exit 1
fi
echo "NDK_TOOLCHAIN_VERSION=${NDK_TOOLCHAIN_VERSION}"

# Get which ar
# Sam: As of right now, I have it that you must apparently be running a 64-bit system if on Windows
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	ar="${NDK_ROOT}/toolchains/arm-linux-androideabi-4.8/prebuilt/windows-x86_64/bin/arm-linux-androideabi-ar"
else
	ar=$(${NDK_ROOT}/ndk-which ar)
fi

if [ ! -f "$ar" ]; then
	echo "Missing the 'ar' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "AR=${ar}"

# Get which strip
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	strip="${NDK_ROOT}/toolchains/arm-linux-androideabi-4.8/prebuilt/windows-x86_64/bin/arm-linux-androideabi-strip"
else
	strip=$(${NDK_ROOT}/ndk-which strip)
fi

if [ ! -f "$strip" ]; then
	echo "Missing the 'strip' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "STRIP=${strip}"

# Create build command
CMD="${NDK_ROOT}/ndk-build --jobs=${CORES} -C ${PWD} NDK_MODULE_PATH=${NDK_MODULE_PATH} APP_PLATFORM=${APP_PLATFORM} APP_ABI=${arch}"
echo "CMD=${CMD}"
echo

# NDK build
export CONFIG="${config}"
echo "Building ${APP_PLATFORM} ${arch} ${config}..."
$CMD
res="$?"
if [ "$res" != "0" ]; then
	echo 'ndk-build failed.'
	exit 1
fi

# Link libraries
if [ "${config}" == "Debug" ]; then
	src="obj/local/${arch}/objs-debug"
else
	src="obj/local/${arch}/objs"
fi
src=$(cd ${src}; pwd)

# Sam: Modify the path so that it replaces /cygwin/c (11 characters) with C: on Windows
# Sam: cygwin must be installed using the default option of making it avaiable for all users (root directory)
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	temp=$src
	src="C:"
	src=$src${temp:11:4200}
fi

echo "SRC=${src}"

# Sam: When rapidgame creates its directories, latest is created as a folder itself and not a symlink on Windows
# Sam: This must be updated for every version of rapidgame to continue to work, unless you get latest to be a symlink like on Mac
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	dest=../../0.9.7/cocos2d/x/lib/${config}-Android/${arch}
else
	dest=../../latest/cocos2d/x/lib/${config}-Android/${arch}
fi

mkdir -p ${dest}
dest=$(cd ${dest}; pwd)

if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	temp=$dest
	dest="C:"
	dest=$dest${temp:11:4200}
fi

echo "DEST=${dest}"

lib="libcocos2dx-prebuilt.a"
rm -f ${dest}/${lib}

# Sam: Replace the backslashes in ar's and strip's paths with forward slashes if on Windows
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	ar=$(echo $ar | sed 's/\\/\//g')
	strip=$(echo $strip | sed 's/\\/\//g')
	echo "AR=${ar}"
	echo "STRIP=${strip}"
fi

for dir in cocos_localstorage_static cocosdenshion_static cocos2dxandroid_static cocos_network_static cocostudio_static \
	audioengine_static cocos3d_static cocos_protobuf-lite_static spine_static box2d_static cocos_extension_static cocos_ui_static \
	cocos2dx_internal_static cocos_jsb_static cocosbuilder_static
do
	${ar} rs ${dest}/${lib} $(find ${src}/${dir} -name *.o)
	${strip} -x ${dest}/${lib}
done