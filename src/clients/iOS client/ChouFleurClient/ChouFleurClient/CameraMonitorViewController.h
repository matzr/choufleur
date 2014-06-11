//
//  CameraMonitorViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 10/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "GPUImage.h"
#import <GLKit/GLKit.h>


@interface CameraMonitorViewController : UIViewController

- (IBAction)back:(id)sender;
@property (weak, nonatomic) IBOutlet UIView *cameraView;

@end
