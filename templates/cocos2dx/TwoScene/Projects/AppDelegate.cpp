///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "AppDelegate.h"
#include "MenuScene.h"
#include "Game.h"

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
	cocos2d::ScriptEngineManager::destroyInstance();
}

void AppDelegate::initGLContextAttrs()
{
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    cocos2d::GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{
	auto director = cocos2d::Director::getInstance();
	auto fileUtils = cocos2d::FileUtils::getInstance();
	auto& winSize = director->getWinSize();

	// set content rect
	cocos2d::Size designRes(2048, 1536);
	cocos2d::Rect contentRect(0, 0, designRes.width, designRes.height);
	if (winSize.width > winSize.height)
	{
		designRes.width = (designRes.height / winSize.height) * winSize.width;
		contentRect.origin.x = (designRes.width - contentRect.size.width) * .5;
	} else {
		designRes.height = (designRes.width / winSize.width) * winSize.height;
		contentRect.origin.y = (designRes.height - contentRect.size.height) * .5;
	}
	Game::setContentRect(contentRect);

	// initialize director
	director->setDisplayStats(true);
	director->setAnimationInterval(1.0 / 60);
	director->getOpenGLView()->setDesignResolutionSize(designRes.width, designRes.height, ResolutionPolicy::SHOW_ALL);
	//log("Win size %.0f,%.0f, design res %.0f,%.0f, content rect %.0f,%.0f,%.0f,%.0f", winSize.width, winSize.height, designRes.width, designRes.height, contentRect.origin.x, contentRect.origin.y, contentRect.size.width, contentRect.size.height);

	// set search paths
	const char* paths[] =
	{
		"Assets",
	};
	for(auto& path : paths)
		fileUtils->addSearchPath(path);

	// create initial scene
	auto scene = new MenuScene;
	scene->init();
	director->runWithScene(scene);
	scene->release();

	return true;
}

void AppDelegate::applicationDidEnterBackground()
{
	cocos2d::Director::getInstance()->stopAnimation();
	CocosDenshion::SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
	CocosDenshion::SimpleAudioEngine::getInstance()->pauseAllEffects();
}

void AppDelegate::applicationWillEnterForeground()
{
	cocos2d::Director::getInstance()->startAnimation();
	CocosDenshion::SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
	CocosDenshion::SimpleAudioEngine::getInstance()->resumeAllEffects();
}


