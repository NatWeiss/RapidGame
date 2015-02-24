///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

//
// in regards to the "AVAudioPlayer is implemented in both..." warning:
// http://stackoverflow.com/questions/6149673/class-foo-is-implemented-in-both-myapp-and-myapptestcase-one-of-the-two-will-be
//

#include "AppDelegate.h"
#include "cocos2d.h"

using namespace cocos2d;

int main(int argc, char *argv[])
{
	AppDelegate app;
	GLView* view = nullptr;
	bool fullscreen = true;
	#ifndef NDEBUG
		fullscreen = false;
	#endif

	// create the gl view
	auto name = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleName"] UTF8String];
	if (fullscreen)
		view = GLViewImpl::createWithFullScreen(name);
	else
		view = GLViewImpl::createWithRect(name, cocos2d::Rect(0, 0, 960, 641));
	Director::getInstance()->setOpenGLView(view);
	
	// run the app
	return Application::getInstance()->run();
}
