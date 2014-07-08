//
//  MonitorViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GPUImage.h"

@interface MonitorViewController : UIViewController<AVAudioRecorderDelegate>

@property (weak, nonatomic) IBOutlet UILabel *statusLabel;
@property (weak, nonatomic) IBOutlet UIButton *recordPauseButton;
@property (weak, nonatomic) IBOutlet UIView *cameraView;
@property (weak, nonatomic) IBOutlet UIView *motionSensorDisabledView;
@property (weak, nonatomic) IBOutlet UIView *darkScreen;
@property (weak, nonatomic) IBOutlet UIButton *goDarkButton;
@property (weak, nonatomic) IBOutlet UIImageView *recordingIcon;
- (IBAction)recordPause:(id)sender;
- (IBAction)close:(id)sender;
- (IBAction)videoFeedbackSwitchChanged:(id)sender;
- (IBAction)goDark:(id)sender;

@end
