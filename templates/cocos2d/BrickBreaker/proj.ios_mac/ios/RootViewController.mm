//
//  Created using [RapidGame](http://wizardfu.com/rapidgame).
//  See the `LICENSE` file for the license governing this code.
//  Developed by Nat Weiss.
//

#import "RootViewController.h"
#import "cocos2d.h"
#import "CCEAGLView.h"

using namespace cocos2d;

@implementation RootViewController

	-(id) initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
	{
		self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
		if (self != nil)
		{
			forcePortrait = NO;
		}
		return self;
	}

	// iOS 5 and older uses this method
	-(BOOL) shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
	{
		if (forcePortrait)
			return YES;
		return UIInterfaceOrientationIsLandscape(interfaceOrientation);
	}

	// iOS 6 and newer uses supportedInterfaceOrientations & shouldAutorotate
	-(NSUInteger) supportedInterfaceOrientations
	{
		#ifdef __IPHONE_6_0
			if (forcePortrait)
				return UIInterfaceOrientationMaskAll;
			return UIInterfaceOrientationMaskLandscape;
		#endif
	}

	-(BOOL) shouldAutorotate
	{
		return !forcePortrait;
	}

	-(UIInterfaceOrientation) preferredInterfaceOrientationForPresentation
	{
		if(forcePortrait)
			return UIInterfaceOrientationPortrait;
		return self.interfaceOrientation;
	}

	-(void) forcePortrait:(BOOL)enabled
	{
		forcePortrait = enabled;
	}

	-(void) didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation
	{
		[super didRotateFromInterfaceOrientation:fromInterfaceOrientation];

		CCEAGLView* view = (CCEAGLView*)self.view;
		CGSize s = CGSizeMake([view getWidth], [view getHeight]);

		Application::getInstance()->applicationScreenSizeChanged((int)s.width, (int)s.height);
	}

	-(BOOL) prefersStatusBarHidden
	{
		return YES;
	}

	-(void) didReceiveMemoryWarning
	{
		// releases the view if it doesn't have a superview
		[super didReceiveMemoryWarning];
		
		// release any cached data, images, etc that aren't in use
	}

	-(void) viewDidUnload
	{
		[super viewDidUnload];
		
		// release any retained subviews of the main view
		// e.g. self.myOutlet = nil;
	}

	-(void) dealloc
	{
		[super dealloc];
	}

@end
