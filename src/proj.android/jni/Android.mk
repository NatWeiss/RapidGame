LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_ABI=$(APP_ABI))
$(info APP_OPTIM=$(APP_OPTIM))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_ARM_MODE := arm

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static

include $(BUILD_SHARED_LIBRARY)


$(call import-module,bindings)
