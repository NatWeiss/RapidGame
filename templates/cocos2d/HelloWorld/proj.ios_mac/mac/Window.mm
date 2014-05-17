//
//  See the file 'LICENSE_iPhoneGameKit.txt' for the license governing this code.
//      The license can also be obtained online at:
//          http://iPhoneGameKit.com/license
//

#import "Window.h"

@implementation Window

	-(void) keyDown:(NSEvent*)event
	{
		EAGLView* eaglView = [EAGLView sharedEGLView];
		//NSLog(@"key %d", [event keyCode]);
		
		// pressed esc?
		if([event keyCode] == 53)
		{
			// cancel full screen
			if( [eaglView isFullScreen] )
				[eaglView setFullScreen:NO];

			// let another responder take it
			else
				[super keyDown:event];
		}
	}

@end