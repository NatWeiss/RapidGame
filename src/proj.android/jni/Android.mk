LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

$(info APP_PLATFORM=$(APP_PLATFORM))
$(info APP_ABI=$(APP_ABI))
$(info APP_OPTIM=$(APP_OPTIM))
$(info APP_CPPFLAGS=$(APP_CPPFLAGS))

LOCAL_MODULE := cocos2djs_shared

LOCAL_MODULE_FILENAME := libcocos2djs

LOCAL_WHOLE_STATIC_LIBRARIES := cocos_jsb_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_chipmunk_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_extension_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_localstorage_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_ui_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_studio_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_network_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_builder_static
LOCAL_WHOLE_STATIC_LIBRARIES += jsb_spine_static
#LOCAL_WHOLE_STATIC_LIBRARIES += cocos2dx_static
#LOCAL_WHOLE_STATIC_LIBRARIES += cocosdenshion_static
#LOCAL_WHOLE_STATIC_LIBRARIES += box2d_static
#LOCAL_WHOLE_STATIC_LIBRARIES += cocos_jsb_static
#LOCAL_WHOLE_STATIC_LIBRARIES += cocosbuilder_static
#LOCAL_WHOLE_STATIC_LIBRARIES += cocostudio_static
#LOCAL_WHOLE_STATIC_LIBRARIES += spine_static


include $(BUILD_SHARED_LIBRARY)


#$(call import-module,2d)
#$(call import-module,audio/android)
$(call import-module,bindings)
$(call import-module,bindings/manual/chipmunk)
$(call import-module,bindings/manual/extension)
$(call import-module,bindings/manual/localstorage)
$(call import-module,bindings/manual/network)
$(call import-module,bindings/manual/cocosbuilder)
$(call import-module,bindings/manual/ui)
$(call import-module,bindings/manual/cocostudio)
$(call import-module,bindings/manual/spine)
