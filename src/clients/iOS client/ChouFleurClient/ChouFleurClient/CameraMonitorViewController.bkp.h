//
//  CameraMonitorViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 10/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <AVFoundation/AVFoundation.h>
#import <CoreImage/CoreImage.h>
#import <ImageIO/ImageIO.h>
#import <AssertMacros.h>
#import <AssetsLibrary/AssetsLibrary.h>

@interface CameraMonitorViewController_bkp : UIViewController {
    BOOL isUsingFrontFacingCamera;
    AVCaptureStillImageOutput *stillImageOutput;
    AVCaptureVideoPreviewLayer *previewLayer;
    AVCaptureVideoDataOutput *videoDataOutput;
    dispatch_queue_t videoDataOutputQueue;
    CGFloat beginGestureScale;
    CGFloat effectiveScale;
}
- (IBAction)back:(id)sender;
@property (weak, nonatomic) IBOutlet UIView *previewView;




@end
