#!/bin/bash

# Directory of script
CWD=$(dirname "$0")
#echo "CWD=${CWD}"
cd $CWD

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
CC_ROOT=$(cd ../.. && pwd)
#SRC_ROOT=$(cd . && pwd)
SRC_ROOT=${CWD}
UNAME=$(uname -s)
NDK_MODULE_PATH="${CC_ROOT}:${CC_ROOT}/external:${SRC_ROOT}"
echo "CC_ROOT=${CC_ROOT}"
echo "NDK_MODULE_PATH=${NDK_MODULE_PATH}"

# Set NDK_TOOLCHAIN_VERSION
# Sam: NDK Toolchain Version 4.9 is now out (NDK r10e)
if [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.9" ]; then
	export NDK_TOOLCHAIN_VERSION="4.9"
elif [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.8" ]; then
	export NDK_TOOLCHAIN_VERSION="4.8"
elif [ -d "${NDK_ROOT}/toolchains/arm-linux-androideabi-4.7" ]; then
	export NDK_TOOLCHAIN_VERSION="4.7"
else
	echo "NDK toolchain version 4.9, 4.8 or 4.7 is required."
	exit 1
fi
echo "NDK_TOOLCHAIN_VERSION=${NDK_TOOLCHAIN_VERSION}"

# Get which ar
# Sam: Tested on Mac as well and it works fine, appending NDK_ROOT to the beginning caused the problem on cygwin
ar=$(ndk-which ar)

if [ ! -f "$ar" ]; then
	echo "Missing the 'ar' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "AR=${ar}"

# Get which strip
strip=$(ndk-which strip)

if [ ! -f "$strip" ]; then
	echo "Missing the 'strip' NDK build tool. Please install the Android NDK and toolchains."
	exit 1
fi
echo "STRIP=${strip}"

# Create build command
CMD="${NDK_ROOT}/ndk-build --jobs=${CORES} -C ${CWD} NDK_MODULE_PATH=${NDK_MODULE_PATH} APP_PLATFORM=${APP_PLATFORM} APP_ABI=${arch}"
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
if [ "${UNAME:0:6}" == "CYGWIN" ]; then
	# Sam: Modify the path so that it replaces /cygdrive/c (11 characters) with C: on Windows
	# Sam: cygwin must be installed in the root directory (recommended option in cygwin's setup)
	temp=$src
	src="C:"
	src=$src${temp:11:4200}
fi
echo "SRC=${src}"

# Sam: When rapidgame creates its directories, latest is created as a folder itself and not a symlink on Windows
# Sam: This must be updated for every version of rapidgame to continue to work, unless you get latest to be a symlink like on Mac
# To Sam: symlinks are possible on Windows and it should be that way (rapidgame init . is working for example...)
# To Nat: Yes, and I encountered the same problem when not running in root. I checked the symlink code in rapidgame.js and
#         it seems you catch the permissions error exception without doing anything. It is okay to just have this line by itself
#         now, but the first time someone creates a cocos2dx project, they MUST run with admin privileges, so that latest is created as a symlink.
dest=../../../../latest/cocos2d/x/lib/${config}-Android/${arch}

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
for dir in audioengine_static  cocos2dx_internal_static  cocos_extension_static  cocos_ui_static  cocostudio_static  spine_static \
	box2d_static  cocos2dxandroid_static  cocos_flatbuffers_static  cocosbuilder_static  bullet_static  cocos3d_static \
	cocos_network_static  cocosdenshion_static  recast_static
do
	${ar} rs ${dest}/${lib} $(find ${src}/${dir} -name *.o)
	if [ "$3" != "nostrip" ]; then
		${strip} -x ${dest}/${lib}
	fi
done

