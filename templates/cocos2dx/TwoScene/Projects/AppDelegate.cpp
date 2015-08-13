///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#include "AppDelegate.h"
#include "MenuScene.h"
#include "MyGame.h"

using namespace cocos2d;
using namespace CocosDenshion;

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
	auto director = Director::getInstance();
	auto fileUtils = FileUtils::getInstance();
	auto view = director->getOpenGLView();
	auto& winSize = director->getWinSize();

	// create opengl view
	if (view == nullptr)
	{
		bool fullscreen = true;
		#ifndef NDEBUG
			fullscreen = false;
		#endif

		// create the gl view
		string name = "TwoScene";
		if (fullscreen)
			view = GLViewImpl::createWithFullScreen(name);
		else
			view = GLViewImpl::createWithRect(name, cocos2d::Rect(0, 0, 960, 640));
		Director::getInstance()->setOpenGLView(view);
	}

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
	MyGame::setContentRect(contentRect);

	// initialize director
	director->setDisplayStats(true);
	director->setAnimationInterval(1.0 / 60);
	view->setDesignResolutionSize(designRes.width, designRes.height, ResolutionPolicy::SHOW_ALL);
	//log("Win size %.0f,%.0f, design res %.0f,%.0f, content rect %.0f,%.0f,%.0f,%.0f", winSize.width, winSize.height, designRes.width, designRes.height, contentRect.origin.x, contentRect.origin.y, contentRect.size.width, contentRect.size.height);

	// set search paths
	for(auto& path : {"Assets"})
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


