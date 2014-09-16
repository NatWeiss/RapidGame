///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include "CCApplication.h"

class AppDelegate : private cocos2d::Application
{
	public:
		AppDelegate();
		virtual ~AppDelegate();

		virtual bool applicationDidFinishLaunching();
		virtual void applicationDidEnterBackground();
		virtual void applicationWillEnterForeground();
};
