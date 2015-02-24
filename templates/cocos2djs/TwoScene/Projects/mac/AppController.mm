///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

#import "AppController.h"
#import <Cocoa/Cocoa.h>

void __openURL(const char* urlCstr)
{
	NSString* str = [[NSString alloc] initWithUTF8String:urlCstr];
	NSURL* url = [[NSURL alloc] initWithString:str];
	[[NSWorkspace sharedWorkspace] openURL:url];
	[url release];
	[str release];
}

@implementation AppController

	-(IBAction) toggleFullScreen:(id)sender
	{
		//EAGLView* v = [EAGLView sharedEGLView];
		//[v setFullScreen:!v.isFullScreen];
	}

	-(IBAction) exitFullScreen:(id)sender
	{
		//[[EAGLView sharedEGLView] setFullScreen:NO];
	}

@end
