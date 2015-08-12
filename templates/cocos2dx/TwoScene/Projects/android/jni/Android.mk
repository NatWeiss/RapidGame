LOCAL_PATH := $(call my-dir)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_OPTIM=$(APP_OPTIM))
$(info CONFIG=$(CONFIG))
$(info ARCH=$(TARGET_ARCH_ABI))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))


include $(CLEAR_VARS)
LOCAL_MODULE := libcocos2dx-prebuilt
LOCAL_SRC_FILES := ../../../lib/cocos2d/x/lib/$(CONFIG)-Android/$(TARGET_ARCH_ABI)/libcocos2dx-prebuilt.a
include $(PREBUILT_STATIC_LIBRARY)


include $(CLEAR_VARS)
LOCAL_MODULE := cocos2dxgame_shared
LOCAL_MODULE_FILENAME := libcocos2dxgame

LOCAL_SRC_FILES := main.cpp \
                   ../../AppDelegate.cpp \
                   ../../Game.cpp \
                   ../../GameScene.cpp \
                   ../../MenuScene.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../.. \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/base \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/physics \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/math/kazmath \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/2d \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/gui \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/network \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/audio/include \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/editor-support \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/extensions \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/external \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/external/chipmunk/include/chipmunk \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/bindings/auto \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/bindings/manual \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/bindings/cocosbuilder \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/cocos/platform/android \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/plugin/protocols/platform/android \
				$(LOCAL_PATH)/../../../lib/cocos2d/x/include/external/spidermonkey/include/android

LOCAL_WHOLE_STATIC_LIBRARIES := libcocos2dx-prebuilt

# cocos2d-x/cocos/2d/Android.mk
LOCAL_CFLAGS   := -Wno-psabi -DUSE_FILE32API

# external/spidermonkey/prebuilt/android/Android.mk
LOCAL_CPPFLAGS := -D__STDC_LIMIT_MACROS=1 -Wno-invalid-offsetof

# cocos2d-x/cocos/2d/Android.mk
LOCAL_CPPFLAGS += -Wno-literal-suffix -Wno-deprecated-declarations

# cocos2d-x/cocos/2d/platform/android/Android.mk
LOCAL_LDLIBS := -lGLESv1_CM \
	-lGLESv2 \
	-lEGL \
	-llog \
	-lOpenSLES \
	-landroid

# remaining external libraries
# (use entire path for libz so that the system version is not used)
LOCAL_LDLIBS += $(LOCAL_PATH)/../../../lib/cocos2d/x/lib/$(CONFIG)-Android/$(APP_ABI)/libz.a
LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../lib/cocos2d/x/lib/$(CONFIG)-Android/$(APP_ABI)
LOCAL_LDLIBS += -lpng -ljpeg -ltiff -lwebp -lcurl -lssl -lcrypto -lfreetype -ljs_static -lwebsockets -lchipmunk

include $(BUILD_SHARED_LIBRARY)

$(call import-module,audio/android)

# $(call import-add-path,$(LOCAL_PATH)/../../../lib/cocos2d/x/java/mk/cocos2d-x/external)
# $(call import-module,bindings)