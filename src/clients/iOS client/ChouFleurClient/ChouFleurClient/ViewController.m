//
//  ViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 21/05/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "ViewController.h"

@interface ViewController () {
    NSString *soundFilePath;
    BOOL recording;
    AVAudioRecorder *soundRecorder;
    NSMutableArray *uploadQueue;
    NSString *sensorUid;
    NSDateFormatter *dateFormatter;
    
    NSString *soundFileName;
    NSMutableDictionary *currentSampleDetails;
    
    NSString *sensorId;
}
@end

@implementation ViewController

int MAX_DURATION_PER_SAMPLE = 60;
float LEVEL_THRESHOLD_TO_SEND = .07;
BOOL ASYNC_POST = YES;



NSString * kAverageLevelKey = @"averageLevel";
NSString * kMaxLevelKey = @"maxLevel";
NSString * kBitRateKey = @"bitRate";
NSString * kSampleRateKey = @"sampleRate";
NSString * kStartDateKey = @"startDate";
NSString * kDurationKey = @"duration";

float sampleRate = 11025.0;
int numberOfChannels = 1;
int quality = AVAudioQualityMin;

- (void)viewDidLoad
{
    dateFormatter = [[NSDateFormatter alloc] init];
    [dateFormatter setDateFormat:@"yyyyMMddHHmmss"];
    [super viewDidLoad];
    
    [self loadSensorDetails];
}

-(void)loadSensorDetails {
    NSUserDefaults* prefs = [NSUserDefaults standardUserDefaults];
    self.sensorIdLabel.text = sensorId = [prefs stringForKey:@"sensorId"];
    self.sensorNameTextField.text = [prefs stringForKey:@"sensorName"];
    self.sensorLongitudeTextField.text = [prefs stringForKey:@"sensorLongitude"];
    self.sensorLatitudeTextField.text = [prefs stringForKey:@"sensorLatitude"];
    self.sensorAccuracy.text = [prefs stringForKey:@"sensorAccuracy"];
    if (sensorId) {
        self.startButton.enabled = YES;
    }
}

-(void)saveSensorDetails {
    NSUserDefaults* prefs = [NSUserDefaults standardUserDefaults];
    [prefs setValue:sensorId forKey:@"sensorId"];
    [prefs setValue:self.sensorNameTextField.text forKey:@"sensorName"];
    [prefs setValue:self.sensorLongitudeTextField.text forKey:@"sensorLongitude"];
    [prefs setValue:self.sensorLatitudeTextField.text forKey:@"sensorLatitude"];
    [prefs setValue:self.sensorAccuracy.text forKey:@"sensorAccuracy"];
    [prefs synchronize];
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

- (IBAction)registerSensor:(id)sender {
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
    [request setURL:[NSURL URLWithString:[appdel.baseUrl stringByAppendingString:@"sensor"]]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    
    NSString *formParams = [NSString stringWithFormat:@"name=%@&longitude=%@&latitude=%@&accuracy=%@", self.sensorNameTextField.text, self.sensorLongitudeTextField.text, self.sensorLatitudeTextField.text, self.sensorAccuracy.text];
    [request setHTTPBody:[formParams dataUsingEncoding:NSUTF8StringEncoding]];
    
    //return and test
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
    
    NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
            NSLog(returnString);
    
    NSDictionary *responseDic = [NSJSONSerialization JSONObjectWithData:returnData options:kNilOptions error:nil];
    if ([[responseDic objectForKey:@"status"] isEqualToString:@"SUCCESS"]) {
        NSDictionary *sensorDetails = [responseDic objectForKey:@"sensor"];
        self.sensorIdLabel.text = sensorId = [sensorDetails valueForKey:@"sensor_id"];
        self.startButton.enabled = YES;
        [self saveSensorDetails];
    }
    
    
}

- (IBAction)stopRecording:(id)sender {
    self.coveringView.hidden = YES;
    if (recording) {
        [soundRecorder updateMeters];
        
        float maxSoundLevel = pow(10.f, 0.05f * [soundRecorder peakPowerForChannel:0]) * 20.0f;
        float averageSoundLevel = pow(10.f, 0.05f * [soundRecorder averagePowerForChannel:0]) * 20.0f;
        
        [currentSampleDetails setValue:@(maxSoundLevel) forKey:kMaxLevelKey];
        [currentSampleDetails setValue:@(averageSoundLevel) forKey:kAverageLevelKey];
        
        [soundRecorder stop];
        recording = NO;

        self.startButton.enabled = YES;
        self.stopButton.enabled = NO;
        //TODO: add to the queue (and start queue watcher if necessary)
        if (maxSoundLevel > LEVEL_THRESHOLD_TO_SEND) {
            NSLog(@"sending file");
            NSLog(soundFilePath);
            NSData *dataToSend = [NSData dataWithContentsOfFile:soundFilePath];
            [self uploadSample:dataToSend withName:soundFileName];
        } else {
            NSLog(@"discarded sample");
        }
//               [soundRecorder deleteRecording];
        soundRecorder = nil;
        [[AVAudioSession sharedInstance] setActive: NO error: nil];
        
        if (self.autoRestartSwitch.on) {
            [self startRecording];
        }
    }
}

-(void)startRecording {
    self.coveringView.hidden = NO;
    if (!recording) {
#if TARGET_IPHONE_SIMULATOR
        NSString *documentsDirectory = @"/tmp";
#else
        NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
        NSString *documentsDirectory = [paths objectAtIndex:0];
#endif
        
        soundFileName = [[NSUUID UUID] UUIDString];
        soundFilePath = [documentsDirectory stringByAppendingPathComponent:soundFileName];
        
        NSLog(@"creating file");
        NSLog(soundFilePath);
        
        [soundRecorder stop];
        recording = NO;
        
        [[AVAudioSession sharedInstance]
         setCategory: AVAudioSessionCategoryRecord
         error: nil];
        
        NSDictionary *recordSettings = @{
                                         AVSampleRateKey: @(sampleRate),
                                         AVFormatIDKey: @(kAudioFormatMPEG4AAC),
                                         AVNumberOfChannelsKey: @(numberOfChannels),
                                         AVEncoderAudioQualityKey: @(quality)
                                         };
        
//        NSDictionary *recordSettings = [NSDictionary dictionaryWithObjectsAndKeys:
//                                         [NSNumber numberWithFloat: 11025.0],                 AVSampleRateKey,
//                                         [NSNumber numberWithInt: kAudioFormatMPEG4AAC], AVFormatIDKey,
//                                         [NSNumber numberWithInt: 1],                         AVNumberOfChannelsKey,
//                                         [NSNumber numberWithInt: AVAudioQualityMin],         AVEncoderAudioQualityKey,
//                                         nil];
        
        currentSampleDetails = [NSMutableDictionary dictionaryWithDictionary:@{
                                                                               kSampleRateKey: @(sampleRate),
                                                                               kStartDateKey: [NSDate date],
                                                                               kDurationKey: @((int)(self.sampleLengthSlider.value))
                                                                               }];
        
        AVAudioRecorder *newRecorder = [[AVAudioRecorder alloc] initWithURL: [NSURL URLWithString:soundFilePath] settings:recordSettings error: nil];
        soundRecorder = newRecorder;
        
        soundRecorder.meteringEnabled = YES;
        soundRecorder.delegate = self;
        [soundRecorder prepareToRecord];
        [soundRecorder record];
        
        recording = YES;
        self.startButton.enabled = NO;
        self.stopButton.enabled = YES;
        
        [NSTimer scheduledTimerWithTimeInterval:self.sampleLengthSlider.value target:self selector:@selector(stopRecording:) userInfo:nil repeats:NO];
    }
}

-(void)audioRecorderDidFinishRecording:(AVAudioRecorder *)recorder successfully: (BOOL)flag
{
    //Your code after sucessful recording;
}
-(void)audioRecorderEncodeErrorDidOccur:(AVAudioRecorder *)recorder error:(NSError *)error
{
    NSLog(@"Encode Error occurred");
}

- (IBAction)sampleValueChanged:(id)sender {
    self.sampleLengthLabel.text = [NSString stringWithFormat:@"%d", (int)((UISlider*)sender).value];
}

- (IBAction)start:(id)sender {
    [self startRecording];
}


-(void)uploadSample:(NSData *)data withName:(NSString *)fileName {
    //token must be formed like this <JS_START_TIME>_<DURATION>
    
    NSDate *sampleStartTime = [currentSampleDetails valueForKey:kStartDateKey];
    NSNumber * duration = [currentSampleDetails valueForKey:kDurationKey];
    NSString *token =[NSString stringWithFormat:@"%lld_%d", ((long long)([sampleStartTime timeIntervalSince1970] * 1000)), [duration intValue]];
    int quality = (int)[[currentSampleDetails valueForKey:kSampleRateKey] floatValue];
    float maxLevel = [[currentSampleDetails valueForKey:kMaxLevelKey] floatValue];
    float averageLevel = [[currentSampleDetails valueForKey:kAverageLevelKey] floatValue];

    NSString *urlString = [appdel.baseUrl stringByAppendingString:[NSString stringWithFormat:@"sampleData/%@/%@/%d/%f_%f", sensorId, token, quality, maxLevel, averageLevel]];
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
    [request setURL:[NSURL URLWithString:urlString]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/octet-stream" forHTTPHeaderField:@"Content-Type"];
    
    [request setHTTPBody:[NSData dataWithData:data]];
    
    //return and test
    //    data = nil;
    if (ASYNC_POST) {
        [NSURLConnection sendAsynchronousRequest:request queue:[NSOperationQueue mainQueue] completionHandler:^(NSURLResponse *response, NSData *returnData, NSError *connectionError) {
            NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
            returnData = nil;
            NSLog(returnString);
            returnString = nil;
        }];
    } else {
        NSString *returnString = [[NSString alloc] initWithData:[NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil] encoding:NSUTF8StringEncoding];
        NSLog(returnString);
    }
}

- (BOOL)textFieldShouldEndEditing:(UITextField *)textField {
    return YES;
}

- (BOOL)textFieldShouldReturn:(UITextField *)textField {
    if (textField == self.sensorAccuracy) {
        [textField resignFirstResponder];
    } else if (textField == self.sensorNameTextField) {
        [self.sensorLatitudeTextField becomeFirstResponder];
    } else if (textField == self.sensorLatitudeTextField) {
        [self.sensorLongitudeTextField becomeFirstResponder];
    } else if (textField == self.sensorLongitudeTextField) {
        [self.sensorAccuracy becomeFirstResponder];
    }
    return YES;
}
@end
