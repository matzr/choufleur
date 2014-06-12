//
//  ViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 21/05/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

@interface ViewController : UIViewController<AVAudioRecorderDelegate, UITextFieldDelegate, UIAlertViewDelegate>
- (IBAction)start:(id)sender;
@property (weak, nonatomic) IBOutlet UIButton *startButton;
@property (weak, nonatomic) IBOutlet UIButton *stopButton;
@property (weak, nonatomic) IBOutlet UILabel *sampleLengthLabel;
@property (weak, nonatomic) IBOutlet UISwitch *autoRestartSwitch;
@property (weak, nonatomic) IBOutlet UISlider *sampleLengthSlider;

@property (weak, nonatomic) IBOutlet UILabel *sensorIdLabel;
@property (weak, nonatomic) IBOutlet UITextField *sensorNameTextField;
@property (weak, nonatomic) IBOutlet UITextField *sensorLatitudeTextField;
@property (weak, nonatomic) IBOutlet UITextField *sensorLongitudeTextField;
@property (weak, nonatomic) IBOutlet UITextField *sensorAccuracy;
@property (weak, nonatomic) IBOutlet UIView *coveringView;

@end
