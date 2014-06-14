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
    BOOL _sensorRegistered;
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

-(void)checkRegistrationStatus {
    _sensorRegistered = ([_userDefaults valueForKey:@"sensorId"] != nil);
    if (_sensorRegistered) {
        self.registrationStatusLabel.text = @"This sensor is registered";
    }
}

-(void)viewWillAppear:(BOOL)animated {
    [self checkRegistrationStatus];
}

#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender
{
    if ([segue.identifier isEqualToString:@"register"] && _sensorRegistered) {
    }
}

-(BOOL)shouldPerformSegueWithIdentifier:(NSString *)identifier sender:(id)sender {
    if ([identifier isEqualToString:@"register"] && _sensorRegistered) {
        [[[UIAlertView alloc] initWithTitle:@"Error" message:@"This sensor is already registered" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
        return NO;
    } else if (([identifier isEqualToString:@"startMonitoring"] || [identifier isEqualToString:@"settings"])&& !_sensorRegistered ) {
        [[[UIAlertView alloc] initWithTitle:@"Error" message:@"You have to register this sensor first" delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
        return NO;
    }
    return YES;
}


- (IBAction)dismissOnboarding:(id)sender {
    [_userDefaults setValue:@(YES) forKey:@"onboardindDismissed"];
    self.onboardingView.hidden = YES;
}
- (IBAction)showHelp:(id)sender {
    self.onboardingView.hidden = NO;
}
@end
