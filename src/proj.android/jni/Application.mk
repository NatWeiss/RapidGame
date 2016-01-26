APP_STL := gnustl_static
APP_CPPFLAGS := -frtti -std=c++11 -fsigned-char -w

ifeq ($(CONFIG),Debug)
	APP_OPTIM := debug
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=1
else
	APP_OPTIM := release
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=0
endif

ifeq ($(DO_JS),1)
	APP_CPPFLAGS += -DCOCOS2D_JAVASCRIPT
endif
