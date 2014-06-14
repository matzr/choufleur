//
//  MainMenuViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface MainMenuViewController : UIViewController

@property (weak, nonatomic) IBOutlet UIView *onboardingView;

- (IBAction)dismissOnboarding:(id)sender;
- (IBAction)showHelp:(id)sender;

@property (weak, nonatomic) IBOutlet UILabel *registrationStatusLabel;

@end
