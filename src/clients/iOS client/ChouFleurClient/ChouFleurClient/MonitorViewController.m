//
//  MonitorViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "MonitorViewController.h"

@interface MonitorViewController () {
    BOOL _recording;
    NSUserDefaults *_userDefaults;
    NSString *_activeCamera;
    float _motionDetectionThreshold;
    float _soundDetectionThreshold;
    int _nbOfPicturesToSendOnDetection;
    int _audioSampleSize;
    NSString *soundFilePath;
    AVAudioRecorder *soundRecorder;
    NSDateFormatter *dateFormatter;
    NSString *soundFileName;
    NSMutableDictionary *currentSampleDetails;
}

@property (nonatomic,strong) NSTimer *picCaptureTimer;
@property (nonatomic,strong) GPUImageStillCamera *videoCamera;
@property (nonatomic,strong) GPUImageView *image;
@property (nonatomic,strong) GPUImageGrayscaleFilter *grayscaleFilter;
@property (nonatomic,assign) BOOL motionDetected;
@property (nonatomic,assign) int nbOfPicturesCaptured;

@end


@implementation MonitorViewController


NSString * kAverageLevelKey = @"averageLevel";
NSString * kMaxLevelKey = @"maxLevel";
NSString * kBitRateKey = @"bitRate";
NSString * kSampleRateKey = @"sampleRate";
NSString * kStartDateKey = @"startDate";
NSString * kDurationKey = @"duration";

float sampleRate = 11025.0;
int numberOfChannels = 1;
int quality = AVAudioQualityMin;

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    UISwipeGestureRecognizer *recognizer = [[UISwipeGestureRecognizer alloc] initWithTarget:self action:@selector(swipedDarkScreen:)];
    recognizer.direction = UISwipeGestureRecognizerDirectionRight | UISwipeGestureRecognizerDirectionLeft;
    [self.darkScreen addGestureRecognizer:recognizer];
}

-(void)viewWillAppear:(BOOL)animated {
    _userDefaults = [NSUserDefaults standardUserDefaults];
    
    dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyyMMddHHmmss"];
    
    _activeCamera = [_userDefaults objectForKey:@"activeCamera"];
    if (_activeCamera == nil) {
        _activeCamera = @"FRONT";
    }
    if (![_activeCamera isEqualToString:@"DISABLED"]) {
        _motionDetectionThreshold = [[_userDefaults objectForKey:@"cameraSensitivy"] isEqualToString:@"HIGH"]?0.002:0.05;
        _soundDetectionThreshold = [[_userDefaults objectForKey:@"audioSensitivy"] isEqualToString:@"HIGH"]?0.07:0.14;
        _nbOfPicturesToSendOnDetection = [[_userDefaults objectForKey:@"numberOfCaptures"] intValue];
        [self startMotionDetection];
        self.motionSensorDisabledView.hidden = YES;
    }
    _audioSampleSize = [[_userDefaults valueForKey:@"audioSampleSize"] intValue];
    [self startAudioMonitoring];
    [[UIApplication sharedApplication] setStatusBarHidden:YES];
    self.darkScreen.hidden = YES;
}

-(void)viewWillDisappear:(BOOL)animated {
    if (![_activeCamera isEqualToString:@"DISABLED"]) {
        [self.videoCamera stopCameraCapture];
        [self.picCaptureTimer invalidate];
    }
    [self stopRecording:self];
    [[UIApplication sharedApplication] setStatusBarHidden:NO];
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

#pragma mark - Motion detection

-(void)captureAndSendPictures {
    dispatch_async(dispatch_get_global_queue( DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self.grayscaleFilter useNextFrameForImageCapture];
        UIImage *capturedImage = [self.grayscaleFilter imageFromCurrentFramebuffer];
        if (self.nbOfPicturesCaptured < _nbOfPicturesToSendOnDetection) {
            dispatch_async(dispatch_get_main_queue(),
                           ^{
                               [self performSelector:@selector(captureAndSendPictures) withObject:nil afterDelay:1.0];
                           });
            
        } else {
            self.nbOfPicturesCaptured = 0;
            self.motionDetected = NO;
        }
        
        if (capturedImage) {
            self.nbOfPicturesCaptured++;
            NSData *imageData = UIImageJPEGRepresentation(capturedImage, .7);
            capturedImage = nil;
            
            NSString *sensorId = [_userDefaults stringForKey:@"sensorId"];
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
                returnString = nil;
            }];
        }
    });
}

-(void)saveLastPicture {
    NSString *lastPictPath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"lastPic.jpg"];
    [self.videoCamera capturePhotoAsImageProcessedUpToFilter:self.grayscaleFilter withCompletionHandler:^(UIImage* image, NSError *error) {
        NSData * binaryImageData = UIImageJPEGRepresentation(image, .3);
        [binaryImageData writeToFile:lastPictPath atomically:NO];
    }];
}

-(void)startMotionDetection {
    self.picCaptureTimer = [NSTimer scheduledTimerWithTimeInterval:.5 target:self selector:@selector(saveLastPicture) userInfo:nil repeats:YES];
    
    self.videoCamera = [[GPUImageStillCamera alloc] initWithSessionPreset:AVCaptureSessionPreset352x288 cameraPosition:[_activeCamera isEqualToString:@"FRONT"]?AVCaptureDevicePositionFront:AVCaptureDevicePositionBack];
    
    self.videoCamera.outputImageOrientation=UIInterfaceOrientationPortrait;
    self.image=[[GPUImageView alloc]initWithFrame:self.cameraView.bounds];
    self.grayscaleFilter=[[GPUImageGrayscaleFilter alloc]init];
    GPUImageMotionDetector *motionDetectionFiter = [[GPUImageMotionDetector alloc] init];
    [motionDetectionFiter setMotionDetectionBlock:^(CGPoint motionCentroid, CGFloat motionIntensity, CMTime frameTime) {
        if ((motionIntensity > _motionDetectionThreshold) && (_recording)) {
            self.nbOfPicturesCaptured = 0;
            if (!self.motionDetected) {
                self.motionDetected = YES;
                [self captureAndSendPictures];
            }
        }
        
    }];
    
    [self.videoCamera addTarget:self.grayscaleFilter];
    [self.videoCamera addTarget:motionDetectionFiter];
    [self.grayscaleFilter addTarget:self.image];
    [self.videoCamera startCameraCapture];
}


#pragma mark - Audio monitoring

- (IBAction)stopRecording:(id)sender {
    [soundRecorder updateMeters];
    
    float maxSoundLevel = pow(10.f, 0.05f * [soundRecorder peakPowerForChannel:0]) * 20.0f;
    float averageSoundLevel = pow(10.f, 0.05f * [soundRecorder averagePowerForChannel:0]) * 20.0f;
    
    [currentSampleDetails setValue:@(maxSoundLevel) forKey:kMaxLevelKey];
    [currentSampleDetails setValue:@(averageSoundLevel) forKey:kAverageLevelKey];
    
    [soundRecorder stop];
    
    if (maxSoundLevel > _soundDetectionThreshold) {
        NSData *dataToSend = [NSData dataWithContentsOfFile:soundFilePath];
        [self uploadSample:dataToSend withName:soundFileName];
    } else {
        NSLog(@"discarded sample");
    }
    [soundRecorder deleteRecording];
    soundRecorder = nil;
    [[AVAudioSession sharedInstance] setActive: NO error: nil];
    
    if (_recording) {
        [self startAudioMonitoring];
    }
}

-(void)startAudioMonitoring {
    NSString *documentsDirectory = NSTemporaryDirectory();
//#if TARGET_IPHONE_SIMULATOR
//    NSString *documentsDirectory = @"/tmp";
//#else
//    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
//    NSString *documentsDirectory = [paths objectAtIndex:0];
//#endif
    
    soundFileName = [[NSUUID UUID] UUIDString];
    soundFilePath = [documentsDirectory stringByAppendingPathComponent:soundFileName];
    
    [soundRecorder stop];
    
    [[AVAudioSession sharedInstance]
     setCategory: AVAudioSessionCategoryRecord
     error: nil];
    
    NSDictionary *recordSettings = @{
                                     AVSampleRateKey: @(sampleRate),
                                     AVFormatIDKey: @(kAudioFormatMPEG4AAC),
                                     AVNumberOfChannelsKey: @(numberOfChannels),
                                     AVEncoderAudioQualityKey: @(quality)
                                     };
    
    currentSampleDetails = [NSMutableDictionary dictionaryWithDictionary:@{
                                                                           kSampleRateKey: @(sampleRate),
                                                                           kStartDateKey: [NSDate date],
                                                                           kDurationKey: @(_audioSampleSize)
                                                                           }];
    
    AVAudioRecorder *newRecorder = [[AVAudioRecorder alloc] initWithURL: [NSURL URLWithString:soundFilePath] settings:recordSettings error: nil];
    soundRecorder = newRecorder;
    
    soundRecorder.meteringEnabled = YES;
    soundRecorder.delegate = self;
    [soundRecorder prepareToRecord];
    [soundRecorder record];
    
    [NSTimer scheduledTimerWithTimeInterval:(double)_audioSampleSize target:self selector:@selector(stopRecording:) userInfo:nil repeats:NO];
}

-(void)uploadSample:(NSData *)data withName:(NSString *)fileName {
    //token must be formed like this <JS_START_TIME>_<DURATION>
    
    NSDate *sampleStartTime = [currentSampleDetails valueForKey:kStartDateKey];
    NSNumber * duration = [currentSampleDetails valueForKey:kDurationKey];
    NSString *token =[NSString stringWithFormat:@"%lld_%d", ((long long)([sampleStartTime timeIntervalSince1970] * 1000)), [duration intValue]];
    int quality = (int)[[currentSampleDetails valueForKey:kSampleRateKey] floatValue];
    float maxLevel = [[currentSampleDetails valueForKey:kMaxLevelKey] floatValue];
    float averageLevel = [[currentSampleDetails valueForKey:kAverageLevelKey] floatValue];
    NSString *sensorId = [_userDefaults stringForKey:@"sensorId"];
    NSString *urlString = [appdel.baseUrl stringByAppendingString:[NSString stringWithFormat:@"sampleData/%@/%@/%d/%f_%f", sensorId, token, quality, maxLevel, averageLevel]];
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
    [request setURL:[NSURL URLWithString:urlString]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/octet-stream" forHTTPHeaderField:@"Content-Type"];
    
    [request setHTTPBody:[NSData dataWithData:data]];
    
    //return and test
    //    data = nil;
    [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *returnData, NSError *connectionError) {
        NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
        returnData = nil;
        returnString = nil;
    }];
}

- (IBAction)recordPause:(id)sender {
    _recording = !_recording;
    self.goDarkButton.hidden = !_recording;
    [self.recordPauseButton setImage:[UIImage imageNamed:(_recording?@"pause button.png":@"record button.png")] forState:UIControlStateNormal];
    self.statusLabel.text = _recording?@"Monitoring":@"Paused (not monitoring)";
}

- (IBAction)close:(id)sender {
    [self dismissModalViewControllerAnimated:YES];
}

- (IBAction)videoFeedbackSwitchChanged:(id)sender {
    UISwitch *feedbackSwitch = sender;
    
    if (feedbackSwitch.on) {
        [self.cameraView addSubview:self.image];
    } else {
        [self.image removeFromSuperview];
    }
}

-(void)swipedDarkScreen:(UIGestureRecognizer*)gestureRecognizer {
    self.darkScreen.hidden = YES;
}

- (IBAction)goDark:(id)sender {
    [[[UIAlertView alloc]initWithTitle:@"Going Dark" message:@"To get back to normal, just swipe this screen left or right." delegate:nil cancelButtonTitle:@"OK" otherButtonTitles: nil] show];
    self.darkScreen.hidden = NO;
}

@end
