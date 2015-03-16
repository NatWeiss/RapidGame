///
/// > Created using [RapidGame](https://github.com/natweiss/rapidgame). See the `LICENSE` file for the license governing this code.
///

#import "RootViewController.h"
#import "cocos2d.h"
#import "CCEAGLView-ios.h"

using namespace cocos2d;

@implementation RootViewController

	-(id) initWithNibName:(NSString*)nibNameOrNil bundle:(NSBundle*)nibBundleOrNil
	{
		self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
		if (self != nil)
		{
			forcePortrait = NO;
			
			// Determine orientation by reading designWidth and designHeight from project.json
			NSString* path = [[NSBundle mainBundle] pathForResource:@"project" ofType:@"json"];
			NSData* data = [NSData dataWithContentsOfFile:path];
			NSError* err = nil;
			NSArray* result = [NSJSONSerialization JSONObjectWithData:data options:kNilOptions error:&err];
			int w = [[result valueForKey:@"designWidth"] intValue];
			int h = [[result valueForKey:@"designHeight"] intValue];
			orientPortrait = (h > w);
			NSLog(@"%d x %d, orientation portrait: %@", w, h, orientPortrait ? @"YES" : @"NO");
		}
		return self;
	}

	// iOS 5 and older uses this method
	-(BOOL) shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
	{
		if (forcePortrait)
			return YES;
		if (orientPortrait)
			return UIInterfaceOrientationIsPortrait(interfaceOrientation);
		return UIInterfaceOrientationIsLandscape(interfaceOrientation);
	}

	// iOS 6 and newer uses supportedInterfaceOrientations & shouldAutorotate
	-(NSUInteger) supportedInterfaceOrientations
	{
		#ifdef __IPHONE_6_0
			if (forcePortrait)
				return UIInterfaceOrientationMaskAll;
			if (orientPortrait)
				return UIInterfaceOrientationMaskPortrait;
			return UIInterfaceOrientationMaskLandscape;
		#endif
	}

	-(BOOL) shouldAutorotate
	{
		return !forcePortrait;
	}

	-(UIInterfaceOrientation) preferredInterfaceOrientationForPresentation
	{
		if (forcePortrait)
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
		
		cocos2d::GLView* glview = cocos2d::Director::getInstance()->getOpenGLView();
		if (glview)
		{
			CCEAGLView* view = (CCEAGLView*)glview->getEAGLView();
			if (view)
			{
				CGSize s = CGSizeMake([view getWidth], [view getHeight]);
				cocos2d::Application::getInstance()->applicationScreenSizeChanged((int)s.width, (int)s.height);
			}
		}
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
