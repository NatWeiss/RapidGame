LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_ABI=$(APP_ABI))
$(info APP_OPTIM=$(APP_OPTIM))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))

$(call import-add-path,$(LOCAL_PATH)/../../..)
$(call import-add-path,$(LOCAL_PATH)/../../../external)
$(call import-add-path,$(LOCAL_PATH)/../../../cocos)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_ARM_MODE := arm

LOCAL_STATIC_LIBRARIES := cocos2dx_static

#
# --- neither of the following solutions work to bake these external libraries into libcocos2dx-prebuilt.a...
# http://stackoverflow.com/questions/13637450/android-ndk-how-to-link-multiple-3rd-party-libraries
# another solution would be to use `ar` in build.sh to extract all the objects from all these external libraries,
# then use `ar` to combine them with all of cocos2d-x' object files...
#

# LOCAL_WHOLE_STATIC_LIBRARIES += cocos_png_static cocos_jpeg_static cocos_tiff_static cocos_webp_static \
#	cocos_curl_static cocos_freetype2_static spidermonkey_static websockets_static cocos_chipmunk_static \
#	cocos_zlib_static

#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/png/prebuilt/android/$(APP_ABI) -lpng
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/jpeg/prebuilt/android/$(APP_ABI) -ljpeg
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/tiff/prebuilt/android/$(APP_ABI) -ltiff
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/webp/prebuilt/android/$(APP_ABI) -lwebp
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/curl/prebuilt/android/$(APP_ABI) -lcurl #-lcrypto -lssl
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/freetype2/prebuilt/android/$(APP_ABI) -lfreetype
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/spidermonkey/prebuilt/android/$(APP_ABI) -ljs_static
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/websockets/prebuilt/android/$(APP_ABI) -lwebsockets
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/chipmunk/prebuilt/android/$(APP_ABI) -lchipmunk
#LOCAL_LDLIBS += -L $(LOCAL_PATH)/../../../external/zlib/prebuilt/android/$(APP_ABI) -lz

# ---

include $(BUILD_SHARED_LIBRARY)

$(call import-module,.)
$(call import-module,scripting/js-bindings/proj.android)
