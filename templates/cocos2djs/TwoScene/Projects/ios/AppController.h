///
/// > Created using [RapidGame](http://wizardfu.com/rapidgame). See the `LICENSE` file for the license governing this code.
///

@class RootViewController;

@interface AppController : NSObject <UIAccelerometerDelegate, UIAlertViewDelegate, UITextFieldDelegate, UIApplicationDelegate>
	{
		UIWindow* window;
		RootViewController* viewController;
	}
@end

