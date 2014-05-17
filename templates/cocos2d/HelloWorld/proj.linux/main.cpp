#include "AppDelegate.h"

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <string>

const char* const kName = "My Game";
const bool kFullscreen = false;
const int kWindowWidth = 1024;
const int kWindowHeight = 768;

using namespace cocos2d;

int main(int argc, char *argv[])
{
	AppDelegate app;
	EGLView eglView;
	
	if( kFullscreen )
		eglView.initWithFullScreen(kName);
	else
		eglView.init(kName, kWindowWidth, kWindowHeight);

	return Application::getInstance()->run();
}
