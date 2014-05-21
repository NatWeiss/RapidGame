APP_STL := gnustl_static
APP_CPPFLAGS := -frtti -DCC_ENABLE_CHIPMUNK_INTEGRATION=1 -std=c++11 -fsigned-char -DCOCOS2D_JAVASCRIPT
APP_PLATFORM = android-18

ifeq ($(CONFIG),debug)
	APP_OPTIM := debug
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=1
	CONFIG := Debug
else
	APP_OPTIM := release
	APP_CPPFLAGS += -DCOCOS2D_DEBUG=0
	CONFIG := Release
endif

