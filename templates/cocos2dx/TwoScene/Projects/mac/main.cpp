///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

//
// in regards to the "AVAudioPlayer is implemented in both..." warning:
// http://stackoverflow.com/questions/6149673/class-foo-is-implemented-in-both-myapp-and-myapptestcase-one-of-the-two-will-be
//

#include "AppDelegate.h"

int main(int argc, char *argv[])
{
	AppDelegate app;
	cocos2d::GLView* view = nullptr;
	bool fullscreen = true;
	#ifndef NDEBUG
		fullscreen = false;
	#endif

	// create the gl view
	string name = "TwoScene";
	if (fullscreen)
		view = cocos2d::GLViewImpl::createWithFullScreen(name);
	else
		view = cocos2d::GLViewImpl::createWithRect(name, cocos2d::Rect(0, 0, 960, 640));
	cocos2d::Director::getInstance()->setOpenGLView(view);
	
	// run the app
	return cocos2d::Application::getInstance()->run();
}
