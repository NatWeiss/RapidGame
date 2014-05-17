LOCAL_PATH := $(call my-dir)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_OPTIM=$(APP_OPTIM))
$(info CONFIG=$(CONFIG))
$(info ARCH=$(TARGET_ARCH_ABI))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))


include $(CLEAR_VARS)
LOCAL_MODULE := libcocos2dx-prebuilt
LOCAL_SRC_FILES := ../../lib/cocos2d/x/lib/$(CONFIG)-Android/$(TARGET_ARCH_ABI)/libcocos2dx-prebuilt.a
include $(PREBUILT_STATIC_LIBRARY)

include $(CLEAR_VARS)
LOCAL_MODULE := cocos2djs_shared
LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_SRC_FILES := main.cpp \
                   ../../src/AppDelegate.cpp

LOCAL_C_INCLUDES := $(LOCAL_PATH)/../../src \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/base \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/physics \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/math/kazmath \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/2d \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/gui \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/network \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/audio/include \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/editor-support \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/extensions \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/external \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/external/chipmunk/include/chipmunk \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/bindings/auto \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/bindings/manual \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/bindings/cocosbuilder \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/cocos/2d/platform/android \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/plugin/protocols/platform/android \
				$(LOCAL_PATH)/../../lib/cocos2d/x/include/external/spidermonkey/include/android

LOCAL_WHOLE_STATIC_LIBRARIES := libcocos2dx-prebuilt
LOCAL_WHOLE_STATIC_LIBRARIES += cocos_png_static cocos_jpeg_static cocos_tiff_static cocos_webp_static cocos_curl_static cocos_freetype2_static spidermonkey_static websockets_static

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
	-lz \
	-landroid

include $(BUILD_SHARED_LIBRARY)


$(call import-module,2d)
$(call import-module,audio/android)
$(call import-module,bindings)
$(call import-module,bindings/manual/chipmunk)
$(call import-module,bindings/manual/cocosbuilder)
$(call import-module,bindings/manual/cocostudio)
$(call import-module,bindings/manual/extension)
$(call import-module,bindings/manual/localstorage)
$(call import-module,bindings/manual/network)
$(call import-module,bindings/manual/spine)
$(call import-module,bindings/manual/ui)
