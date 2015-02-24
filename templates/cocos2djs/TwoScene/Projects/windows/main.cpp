#include "main.h"
#include "AppDelegate.h"
#include "cocos2d.h"

#include <TCHAR.h>
#include <stdio.h>
#include <shellapi.h>

using namespace cocos2d;

int APIENTRY _tWinMain(HINSTANCE hInstance,
                       HINSTANCE hPrevInstance,
                       LPTSTR    lpCmdLine,
                       int       nCmdShow)
{
	UNREFERENCED_PARAMETER(hPrevInstance);
	UNREFERENCED_PARAMETER(lpCmdLine);

	// set current working directory to executable's path
	{
		// get to path to the exe
		TCHAR exePath[MAX_PATH];
		GetModuleFileName(NULL, exePath, MAX_PATH);

		// terminate the string at the end of the path
		TCHAR* trailingSlash = wcsrchr(exePath, '\\');
		if(trailingSlash)
			*trailingSlash = NULL;

		// switch to the directory of the exe
		SetCurrentDirectory(exePath);
	}

	bool fullscreen = false;
	#ifdef NDEBUG
		fullscreen = false;
	#endif

	// create the application instance
	AppDelegate app;

	// set the view
	GLView* view = nullptr;
	if (fullscreen)
		view = GLViewImpl::createWithFullScreen("TwoScene");
	else
		view = GLViewImpl::createWithRect("TwoScene", Rect(0, 0, 1024, 768));
	Director::getInstance()->setOpenGLView(view);

	return Application::getInstance()->run();
}
