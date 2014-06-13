//
//  SettingsViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface SettingsViewController : UIViewController

- (IBAction)close:(id)sender;
- (IBAction)save:(id)sender;

- (IBAction)audioSampleSizeChanged:(id)sender;
- (IBAction)numberOfPhotoCapturesChanged:(id)sender;
- (IBAction)audioSensitivityChanged:(id)sender;
- (IBAction)activeCameraSettingChanged:(id)sender;
- (IBAction)cameraSensitivityChanged:(id)sender;



@property (weak, nonatomic) IBOutlet UILabel *audioSampleSizeLabel;
@property (weak, nonatomic) IBOutlet UILabel *numberOfPhotoCapturesLabel;
@property (weak, nonatomic) IBOutlet UIButton *saveButton;
@property (weak, nonatomic) IBOutlet UIButton *closeButton;


@property (weak, nonatomic) IBOutlet UISegmentedControl *audioSensitivitySegmentedControl;
@property (weak, nonatomic) IBOutlet UISegmentedControl *videoSensitivitySegmentedControl;
@property (weak, nonatomic) IBOutlet UISegmentedControl *activeCameraSegmentedControl;

@property (weak, nonatomic) IBOutlet UISlider *audioSampleSizeSlider;
@property (weak, nonatomic) IBOutlet UISlider *numberOfCapturesSlider;

@end
