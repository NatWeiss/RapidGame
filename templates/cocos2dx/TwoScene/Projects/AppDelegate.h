///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "cocos2d.h"
#include "SimpleAudioEngine.h"
#include "chipmunk.h"

using namespace cocos2d;
using namespace CocosDenshion;
using cocos2d::Rect;
using namespace std;

class AppDelegate : private Application
{
	public:
		AppDelegate();
		virtual ~AppDelegate();

		void initGLContextAttrs() override;
		virtual bool applicationDidFinishLaunching();
		virtual void applicationDidEnterBackground();
		virtual void applicationWillEnterForeground();
};
