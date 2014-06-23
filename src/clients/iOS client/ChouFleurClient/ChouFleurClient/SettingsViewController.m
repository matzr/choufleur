//
//  SettingsViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "SettingsViewController.h"
#import <AVFoundation/AVFoundation.h>

@interface SettingsViewController () {
    NSUserDefaults* _userDefaults;
    BOOL _frontCameraAvailable;
}

@end

@implementation SettingsViewController

NSString* cameraSensitivyKey = @"cameraSensitivy";
NSString* audioSensitivyKey = @"audioSensitivy";
NSString* activeCameraKey = @"activeCamera";

NSString* audioSampleSizeKey = @"audioSampleSize";
NSString* numberOfCapturesKey = @"numberOfCaptures";


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
    
    BOOL frontCam = NO;
    BOOL backCam = NO;

    NSArray *devices = [AVCaptureDevice devicesWithMediaType:AVMediaTypeVideo];
    for (AVCaptureDevice *device in devices)
    {
        if ([device position] == AVCaptureDevicePositionFront)
        {
            frontCam = YES;
        } else if ([device position] == AVCaptureDevicePositionBack) {
            backCam = YES;
        }
    }
    
    [self.activeCameraSegmentedControl setEnabled:frontCam forSegmentAtIndex:1];
    [self.activeCameraSegmentedControl setEnabled:backCam forSegmentAtIndex:2];
    _frontCameraAvailable = frontCam;
}

-(void)viewWillAppear:(BOOL)animated {
    [self loadCurrentSettings];
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

- (IBAction)close:(id)sender {
    _userDefaults = nil;
    [self dismissModalViewControllerAnimated:YES];
}

- (IBAction)save:(id)sender {
    [_userDefaults setValue:@((int)self.audioSampleSizeSlider.value) forKey:audioSampleSizeKey];
    [_userDefaults setValue:@((int)self.numberOfCapturesSlider.value) forKey:numberOfCapturesKey];
    [_userDefaults setValue:(self.audioSensitivitySegmentedControl.selectedSegmentIndex == 0)?@"HIGH":@"LOW" forKey:audioSensitivyKey];
    [_userDefaults setValue:(self.videoSensitivitySegmentedControl.selectedSegmentIndex == 0)?@"HIGH":@"LOW" forKey:cameraSensitivyKey];

    switch (self.activeCameraSegmentedControl.selectedSegmentIndex) {
        case 1:
            [_userDefaults setValue:@"FRONT" forKey:activeCameraKey];
            break;
        case 2:
            [_userDefaults setValue:@"BACK" forKey:activeCameraKey];
            break;
        default:
            [_userDefaults setValue:@"DISABLED" forKey:activeCameraKey];
            break;
    }

    [_userDefaults synchronize];
    [self close:sender];
}

-(void)enableSave {
    self.saveButton.hidden = false;
    [self.closeButton setTitle:@"Cancel" forState:UIControlStateNormal];
}

- (IBAction)audioSampleSizeChanged:(id)sender {
    UISlider* slider = sender;
    int newValue = (int)slider.value;
    self.audioSampleSizeLabel.text = [NSString stringWithFormat:@"%d s", newValue];
    [self enableSave];
}

- (IBAction)numberOfPhotoCapturesChanged:(id)sender {
    UISlider* slider = sender;
    int newValue = (int)slider.value;
    self.numberOfPhotoCapturesLabel.text = [NSString stringWithFormat:@"%d", newValue];
    [self enableSave];
}

- (IBAction)audioSensitivityChanged:(id)sender {
    [self enableSave];}

- (IBAction)activeCameraSettingChanged:(id)sender {
    [self enableSave];
}

- (IBAction)cameraSensitivityChanged:(id)sender {
    [self enableSave];
}

-(void)loadCurrentSettings {
    _userDefaults = [NSUserDefaults standardUserDefaults];

    //audio sens.
    NSString *audioSensitivy = [_userDefaults valueForKey:audioSensitivyKey];
    if (!audioSensitivy) {
        audioSensitivy = @"HIGH";
    }
    self.audioSensitivitySegmentedControl.selectedSegmentIndex = ([audioSensitivy isEqualToString:@"HIGH"]?0:1);
    
    //cam sens.
    NSString *cameraSensitivity = [_userDefaults valueForKey:cameraSensitivyKey];
    if (!cameraSensitivity) {
        cameraSensitivity = @"HIGH";
    }
    self.videoSensitivitySegmentedControl.selectedSegmentIndex = ([cameraSensitivity isEqualToString:@"HIGH"]?0:1);
    
    //audio sample size
    int audioSampleSize = [[_userDefaults objectForKey:audioSampleSizeKey] intValue];
    if (!audioSampleSize) {
        audioSampleSize = 30;
    }
    self.audioSampleSizeSlider.value = audioSampleSize;
    self.audioSampleSizeLabel.text = [NSString stringWithFormat:@"%d s", audioSampleSize];
    
    //nbr of captures
    int numberOfCaptures = [[_userDefaults objectForKey:numberOfCapturesKey] intValue];
    if (!numberOfCaptures) {
        numberOfCaptures = 5;
    }
    self.numberOfCapturesSlider.value = numberOfCaptures;
    self.numberOfPhotoCapturesLabel.text = [NSString stringWithFormat:@"%d", numberOfCaptures];
    
    //active cam
    NSString *activeCam = [_userDefaults valueForKey:activeCameraKey];
    if (!activeCam && _frontCameraAvailable) {
        activeCam = @"FRONT";
    } else {
        activeCam = @"DISABLED";
    }
    [_userDefaults setValue:activeCam forKey:activeCameraKey];
    [_userDefaults synchronize];
    if ([activeCam isEqualToString:@"DISABLED"]) {
        self.activeCameraSegmentedControl.selectedSegmentIndex = 0;
    } else if ([activeCam isEqualToString:@"FRONT"]) {
        self.activeCameraSegmentedControl.selectedSegmentIndex = 1;
    } else if ([activeCam isEqualToString:@"BACK"]) {
        self.activeCameraSegmentedControl.selectedSegmentIndex = 2;
    }
    
}
@end
