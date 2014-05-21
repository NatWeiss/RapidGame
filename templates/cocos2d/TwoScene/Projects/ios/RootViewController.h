//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#import <UIKit/UIKit.h>

@interface RootViewController : UIViewController
	{
		BOOL forcePortrait;
		BOOL orientPortrait;
	}

	-(BOOL) prefersStatusBarHidden;
	-(void) forcePortrait:(BOOL)enabled;
@end
