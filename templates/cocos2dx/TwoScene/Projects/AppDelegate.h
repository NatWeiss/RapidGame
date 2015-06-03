///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

#include <string>
#include <sstream>
#include <deque>
#include <memory>
#include <vector>
#include <map>
#include <list>
#include <stdlib.h>
#include <math.h>
#include <iomanip>
using namespace std;

#include "cocos2d.h"
#include "SimpleAudioEngine.h"
#include "chipmunk.h"

class AppDelegate : private cocos2d::Application
{
	public:
		AppDelegate();
		virtual ~AppDelegate();

		void initGLContextAttrs() override;
		virtual bool applicationDidFinishLaunching();
		virtual void applicationDidEnterBackground();
		virtual void applicationWillEnterForeground();
};
