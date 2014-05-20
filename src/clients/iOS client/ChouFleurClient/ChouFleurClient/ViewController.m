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
}

@end

@implementation ViewController

- (void)viewDidLoad
{
    [super viewDidLoad];
	// Do any additional setup after loading the view, typically from a nib.
}

- (void)didReceiveMemoryWarning
{
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}


-(void)startRecording {
    NSError *error = nil;
    
    AVAudioSession *audioS =[AVAudioSession sharedInstance];
    [audioS setCategory:AVAudioSessionCategoryPlayAndRecord error:&error];
    [audioS setActive:YES error:&error];
    
#if TARGET_IPHONE_SIMULATOR
    NSString *documentsDirectory = @"/tmp";
#else
    NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
    NSString *documentsDirectory = [paths objectAtIndex:0];
#endif
    soundFilePath = [documentsDirectory stringByAppendingPathComponent:@"sound.m4a"];

    
    
//    NSString *soundFilePath = @"/dev/null";
    
    
    NSDictionary *settings = @{
                               AVSampleRateKey: @(44100.0),
                               AVFormatIDKey: @(kAudioFormatMPEG4AAC),
                               AVNumberOfChannelsKey: @(2),
                               AVEncoderAudioQualityKey: @(AVAudioQualityLow)
                               };
    
    
    AVAudioRecorder *recorder = [[ AVAudioRecorder alloc] initWithURL:[NSURL URLWithString:soundFilePath] settings:settings error:&error];
    [recorder setDelegate:self];
    [recorder prepareToRecord];
    recorder.meteringEnabled = YES;
    
    [recorder recordForDuration:(NSTimeInterval) 10];
    [NSTimer scheduledTimerWithTimeInterval:10 target:self selector:@selector(enableStartButton) userInfo:nil repeats:NO];
    
    
}

-(void)enableStartButton {
    self.startButton.enabled = YES;
}


- (IBAction)start:(id)sender {
    self.startButton.enabled = NO;
    [self startRecording];
}
- (IBAction)upload:(id)sender {
    [self uploadSample];
}

-(void)uploadSample {
    NSString *urlString = @"http://localhost:21177/sampleData/a/b/c";
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
    [request setURL:[NSURL URLWithString:urlString]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/octet-stream" forHTTPHeaderField:@"Content-Type"];
    
    NSMutableData *body = [NSData dataWithContentsOfFile:soundFilePath];
    
    [request setHTTPBody:body];
    
    //return and test
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
    NSString *returnString = [[NSString alloc] initWithData:returnData encoding:NSUTF8StringEncoding];
    NSLog(returnString);
}
@end
