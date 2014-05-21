//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#import <UIKit/UIKit.h>
#import "cocos2d.h"
#import "AppController.h"
#import "AppDelegate.h"
#import "RootViewController.h"
#import "CCEAGLView.h"

using namespace cocos2d;

void __openURL(const char* urlCstr)
{
	NSString* str = [[NSString alloc] initWithUTF8String:urlCstr];
	NSURL* url = [[NSURL alloc] initWithString:str];
	[[UIApplication sharedApplication] openURL:url];
	[url release];
	[str release];
}

@implementation AppController

	static AppDelegate s_sharedApplication;

	-(BOOL) application:(UIApplication*)application didFinishLaunchingWithOptions:(NSDictionary*)launchOptions
	{
		// create window
		window = [[UIWindow alloc] initWithFrame:[[UIScreen mainScreen] bounds]];
		CCEAGLView* eaglView = [CCEAGLView viewWithFrame: [window bounds]
			pixelFormat: kEAGLColorFormatRGBA8
			depthFormat: GL_DEPTH24_STENCIL8_OES // was GL_DEPTH_COMPONENT16
			preserveBackbuffer: NO
			sharegroup: nil
			multiSampling: NO
			numberOfSamples: 0];

		[eaglView setMultipleTouchEnabled:YES];

		// use root view controller manage gl view
		viewController = [[RootViewController alloc] initWithNibName:nil bundle:nil];
		viewController.wantsFullScreenLayout = YES;
		viewController.view = eaglView;

		// add root view controller to window
		if( [[UIDevice currentDevice].systemVersion floatValue] < 6.0 )
			[window addSubview: viewController.view];
		else
			[window setRootViewController:viewController];
		[window makeKeyAndVisible];

		[[UIApplication sharedApplication] setStatusBarHidden:YES];

		// setting the GLView should be done after creating the RootViewController
		GLView *glview = GLView::createWithEAGLView(eaglView);
		Director::getInstance()->setOpenGLView(glview);

		Application::getInstance()->run();
		return YES;
	}

	-(void) applicationWillResignActive:(UIApplication*)application
	{
		Director::getInstance()->pause();
	}

	-(void) applicationDidBecomeActive:(UIApplication*)application
	{
		Director::getInstance()->resume();
	}

	-(void) applicationDidEnterBackground:(UIApplication*)application
	{
		Application::getInstance()->applicationDidEnterBackground();
	}

	-(void) applicationWillEnterForeground:(UIApplication*)application
	{
		Application::getInstance()->applicationWillEnterForeground();
	}

	-(void) applicationWillTerminate:(UIApplication*)application
	{
	}

	-(void) applicationDidReceiveMemoryWarning:(UIApplication*)application
	{
		Director::getInstance()->purgeCachedData();
	}

@end

