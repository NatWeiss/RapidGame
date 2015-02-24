///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#pragma once

//#import "cocos2d.h"
//#import "EAGLView.h"
//#import "Window.h"

@interface AppController : NSObject //<NSApplicationDelegate>

//	@property (nonatomic, assign) IBOutlet Window* window;
//	@property (nonatomic, assign) IBOutlet EAGLView* glView;

	-(IBAction) toggleFullScreen:(id)sender;
	-(IBAction) exitFullScreen:(id)sender;

@end
