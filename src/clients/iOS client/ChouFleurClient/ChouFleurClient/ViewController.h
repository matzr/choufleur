//
//  ViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 21/05/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>

@interface ViewController : UIViewController<AVAudioRecorderDelegate>
- (IBAction)start:(id)sender;
@property (weak, nonatomic) IBOutlet UIButton *startButton;

@end
