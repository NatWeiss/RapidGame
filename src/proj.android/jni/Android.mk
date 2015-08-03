LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_ABI=$(APP_ABI))
$(info APP_OPTIM=$(APP_OPTIM))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))

$(call import-add-path,$(LOCAL_PATH)/../../cocos2d-x)
$(call import-add-path,$(LOCAL_PATH)/../../cocos2d-x/external)
$(call import-add-path,$(LOCAL_PATH)/../../cocos2d-x/cocos)

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_ARM_MODE := arm

# this might need to be LOCAL_WHOLE_STATIC_LIBRARIES... ?
LOCAL_STATIC_LIBRARIES := cocos2dx_static

include $(BUILD_SHARED_LIBRARY)

$(call import-module,.)
$(call import-module,scripting/js-bindings/proj.android)
