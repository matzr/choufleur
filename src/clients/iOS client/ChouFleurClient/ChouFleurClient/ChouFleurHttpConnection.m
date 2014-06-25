//
//  ChouFleurHttpConnection.m
//  SensyCam Sensor
//
//  Created by Mathieu Gardere on 24/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "ChouFleurHttpConnection.h"
#import "AppDelegate.h"
#import "HTTPErrorResponse.h"
#import "HTTPDataResponse.h"

@implementation ChouFleurHttpConnection

-(NSObject<HTTPResponse> *)httpResponseForMethod:(NSString *)method URI:(NSString *)path {
    NSArray* pathComponents = [path componentsSeparatedByString:@"/"];
    
    if ([pathComponents count] < 3) {
        return [[HTTPErrorResponse alloc] initWithErrorCode:599];
    }
    
    NSString *token = [pathComponents objectAtIndex:1];
    NSString *command = [pathComponents objectAtIndex:2];
    
    if (![appdel.authToken isEqualToString:token]) {
        return [[HTTPErrorResponse alloc] initWithErrorCode:599];
    }
    
    if ([command isEqualToString:@"PING"]) {
        return [[HTTPDataResponse alloc] initWithData:[@"PONG" dataUsingEncoding:NSUTF8StringEncoding]];
    }
    
    if ([command isEqualToString:@"PIC"]) {
        NSString *lastPicFilePath = [NSTemporaryDirectory() stringByAppendingPathComponent:@"lastPic.jpg"];
        if ([[NSFileManager defaultManager] fileExistsAtPath:lastPicFilePath]) {
            return [[HTTPDataResponse alloc] initWithData:[NSData dataWithContentsOfFile:lastPicFilePath]];
        } else {
            //No 'last picture' found (are we currently monitoring?)
            return [[HTTPErrorResponse alloc] initWithErrorCode:598];
        }
    }

    if ([command isEqualToString:@"SND"]) {
        //TODO: return the last sound capture
        //        return [[HTTPDataResponse alloc] initWithData:[@"PONG" dataUsingEncoding:NSUTF8StringEncoding]];
    }
    
    return nil;
}

@end
