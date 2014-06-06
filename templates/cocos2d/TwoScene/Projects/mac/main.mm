//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

//
// in regards to the "AVAudioPlayer is implemented in both..." warning:
// http://stackoverflow.com/questions/6149673/class-foo-is-implemented-in-both-myapp-and-myapptestcase-one-of-the-two-will-be
//

#include "AppDelegate.h"
#include "cocos2d.h"

const bool kFullscreen = false;
const int kWindowWidth = 1024;
const int kWindowHeight = 768;

using namespace cocos2d;

int main(int argc, char *argv[])
{
	AppDelegate app;
/*	GLView glView;
	
	auto name = [[[NSBundle mainBundle] objectForInfoDictionaryKey:@"CFBundleName"] UTF8String];
	if( kFullscreen )
		glView.initWithFullScreen(name);
	else
		glView.init(name, kWindowWidth, kWindowHeight);
*/
	return Application::getInstance()->run();
}
