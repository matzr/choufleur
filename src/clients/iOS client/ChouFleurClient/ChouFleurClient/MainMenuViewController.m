//
//  MainMenuViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "MainMenuViewController.h"

@interface MainMenuViewController () {
    NSUserDefaults *_userDefaults;
}

@end

@implementation MainMenuViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    _userDefaults = [NSUserDefaults standardUserDefaults];
    self.onboardingView.hidden = [[_userDefaults objectForKey:@"onboardindDismissed"] boolValue];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

- (IBAction)dismissOnboarding:(id)sender {
    [_userDefaults setValue:@(YES) forKey:@"onboardindDismissed"];
    self.onboardingView.hidden = YES;
}
- (IBAction)showHelp:(id)sender {
    self.onboardingView.hidden = NO;
}
@end
