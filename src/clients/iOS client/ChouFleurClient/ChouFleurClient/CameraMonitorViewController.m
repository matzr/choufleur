//
//  CameraMonitorViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 10/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "CameraMonitorViewController.h"

@interface CameraMonitorViewController () {
    NSDate * detectionStart;
}

@property (nonatomic,strong) GPUImageStillCamera *videoCamera;
@property (nonatomic,strong) GPUImageView *image;
@property (nonatomic,strong) GPUImageGrayscaleFilter *grayscaleFilter;
@property (nonatomic,assign) BOOL motionDetected;
@property (nonatomic,assign) int nbOfPicturesCaptured;
@property (nonatomic,strong) UIImage *capturedImage;
@end

@implementation CameraMonitorViewController

const float MOTION_DETECTION_THRESHOLD = 0.005;
const int NB_OF_PICTURES_TO_SEND_ON_DETECTION = 5;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (IBAction)back:(id)sender {
    [self dismissModalViewControllerAnimated:YES];
}


- (void)viewDidLoad
{
    [super viewDidLoad];
    self.nbOfPicturesCaptured = 0;
    self.motionDetected = NO;
    detectionStart = [[NSDate date] dateByAddingTimeInterval:5];
    [self startMotionDetection];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

-(void)startMotionDetection {
    self.videoCamera = [[GPUImageStillCamera alloc] initWithSessionPreset:AVCaptureSessionPreset640x480 cameraPosition:AVCaptureDevicePositionFront];
    
    self.videoCamera.outputImageOrientation=UIInterfaceOrientationPortrait;
    self.image=[[GPUImageView alloc]initWithFrame:CGRectMake(0.0, 0.0, self.cameraView.frame.size.width, self.cameraView.frame.size.height)];
    self.grayscaleFilter=[[GPUImageGrayscaleFilter alloc]init];
    GPUImageMotionDetector *motionDetectionFiter = [[GPUImageMotionDetector alloc] init];
    [motionDetectionFiter setMotionDetectionBlock:^(CGPoint motionCentroid, CGFloat motionIntensity, CMTime frameTime) {
        if (motionIntensity > MOTION_DETECTION_THRESHOLD) {
            self.nbOfPicturesCaptured = 0;
            if (!self.motionDetected) {
                NSLog(@"motion detected");
                self.motionDetected = YES;
                [self captureAndSendPictures];
            }
        }
        
    }];
    
    [self.cameraView addSubview:self.image];
    [self.videoCamera addTarget:self.grayscaleFilter];
    [self.videoCamera addTarget:motionDetectionFiter];
    [self.grayscaleFilter addTarget:self.image];
    [self.videoCamera startCameraCapture];
}

-(void)captureAndSendPictures {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self.grayscaleFilter useNextFrameForImageCapture];
        self.capturedImage = [self.grayscaleFilter imageFromCurrentFramebuffer];
        if (self.nbOfPicturesCaptured < NB_OF_PICTURES_TO_SEND_ON_DETECTION) {
            dispatch_async(dispatch_get_main_queue(),
                           ^{
                               [self performSelector:@selector(captureAndSendPictures) withObject:nil afterDelay:1.0];
                           });
            
        } else {
            self.nbOfPicturesCaptured = 0;
            self.motionDetected = NO;
        }
        
        if (self.capturedImage) {
            self.nbOfPicturesCaptured++;
            NSData *imageData = UIImageJPEGRepresentation(self.capturedImage, .7);
            self.capturedImage = nil;
            
            NSUserDefaults* prefs = [NSUserDefaults standardUserDefaults];
            NSString *sensorId = [prefs stringForKey:@"sensorId"];
            NSString *token = [NSString stringWithFormat:@"%lld", ((long long)([[NSDate date] timeIntervalSince1970] * 1000))];
            NSString *urlString = [appdel.baseUrl stringByAppendingString:[NSString stringWithFormat:@"samplePicture/%@/%@", sensorId, token]];
            NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
            [request setURL:[NSURL URLWithString:urlString]];
            [request setHTTPMethod:@"POST"];
            [request setValue:@"application/octet-stream" forHTTPHeaderField:@"Content-Type"];
            [request setHTTPBody:[NSData dataWithData:imageData]];
            
            
            [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *returnData, NSError *connectionError) {
                NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
                returnData = nil;
                NSLog(returnString);
                returnString = nil;
            }];
        }
    });
}

-(void)stopMotionDetection {
    [self.videoCamera stopCameraCapture];
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

@end
