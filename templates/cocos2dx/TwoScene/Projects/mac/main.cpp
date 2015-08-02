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
	return cocos2d::Application::getInstance()->run();
}
