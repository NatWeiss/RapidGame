///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "AppDelegate.h"
#include "SimpleAudioEngine.h"
#include "jsb_cocos2dx_auto.hpp"
#include "jsb_cocos2dx_ui_auto.hpp"
#include "jsb_cocos2dx_studio_auto.hpp"
#include "jsb_cocos2dx_builder_auto.hpp"
#include "jsb_cocos2dx_spine_auto.hpp"
#include "jsb_cocos2dx_extension_auto.hpp"
#include "ui/jsb_cocos2dx_ui_manual.h"
#include "cocostudio/jsb_cocos2dx_studio_manual.h"
#include "cocosbuilder/js_bindings_ccbreader.h"
#include "spine/jsb_cocos2dx_spine_manual.h"
#include "extension/jsb_cocos2dx_extension_manual.h"
#include "localstorage/js_bindings_system_registration.h"
#include "chipmunk/js_bindings_chipmunk_registration.h"
#include "jsb_opengl_registration.h"
#include "network/XMLHTTPRequest.h"
#include "network/jsb_websocket.h"
#include "network/jsb_socketio.h"
#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
	#include "platform/android/CCJavascriptJavaBridge.h"
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
	#include "platform/ios/JavaScriptObjCBridge.h"
#endif

using namespace cocos2d;
using namespace CocosDenshion;
using cocos2d::Rect;

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
	ScriptEngineManager::destroyInstance();
}

void AppDelegate::initGLContextAttrs()
{
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
	// initialize director
	auto director = Director::getInstance();
	director->setDisplayStats(true);
	director->setAnimationInterval(1.0 / 60);

	// set search paths
	auto fileUtils = FileUtils::getInstance();
	const char* paths[] =
	{
		"script",
	};
	for(auto& path : paths)
		fileUtils->addSearchPath(path);

	// setup jsb
	auto sc = ScriptingCore::getInstance();
	sc->addRegisterCallback(register_all_cocos2dx);
	sc->addRegisterCallback(register_cocos2dx_js_core);
	sc->addRegisterCallback(register_cocos2dx_js_extensions);
	sc->addRegisterCallback(jsb_register_system);
	#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
		sc->addRegisterCallback(JavascriptJavaBridge::_js_register);
	#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
		sc->addRegisterCallback(JavaScriptObjCBridge::_js_register);
	#endif

	// the following are optional
	sc->addRegisterCallback(register_all_cocos2dx_extension);
	sc->addRegisterCallback(register_all_cocos2dx_extension_manual);
	sc->addRegisterCallback(jsb_register_chipmunk);
	sc->addRegisterCallback(JSB_register_opengl);
	sc->addRegisterCallback(register_all_cocos2dx_builder);
	sc->addRegisterCallback(register_CCBuilderReader);
	sc->addRegisterCallback(register_all_cocos2dx_ui);
	sc->addRegisterCallback(register_all_cocos2dx_ui_manual);
	sc->addRegisterCallback(register_all_cocos2dx_studio);
	sc->addRegisterCallback(register_all_cocos2dx_studio_manual);
	sc->addRegisterCallback(register_all_cocos2dx_spine);
	sc->addRegisterCallback(register_all_cocos2dx_spine_manual);
	sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
	sc->addRegisterCallback(register_jsb_websocket);
	sc->addRegisterCallback(register_jsb_socketio);


	sc->start();
	sc->runScript("script/jsb_boot.js");

	ScriptEngineManager::getInstance()->setScriptEngine(sc);
	sc->runScript("Assets/lib/Game.js");

	return true;
}

void AppDelegate::applicationDidEnterBackground()
{
	Director::getInstance()->stopAnimation();
	SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
	SimpleAudioEngine::getInstance()->pauseAllEffects();
}

void AppDelegate::applicationWillEnterForeground()
{
	Director::getInstance()->startAnimation();
	SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
	SimpleAudioEngine::getInstance()->resumeAllEffects();
}


