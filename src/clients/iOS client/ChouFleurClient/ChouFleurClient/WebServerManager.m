//
//  WebServerManager.m
//  SensyCam Sensor
//
//  Created by Mathieu Gardere on 24/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "WebServerManager.h"
#import "ChouFleurHttpConnection.h"



@implementation WebServerManager

-(id)init {
    self = [super init];
    if (self) {
        httpServer = [[HTTPServer alloc] init];
        [httpServer setConnectionClass:[ChouFleurHttpConnection class]];
        [httpServer setType:@"_http._tcp."];
        [httpServer setPort:21177];
    }
    return self;
}

-(void)startServer {
	NSError *error;
	BOOL success = [httpServer start:&error];
	
	if(!success)
	{
		NSLog(@"Error starting HTTP Server: %@", error);
	}
}

-(void)stopServer {
    [httpServer stop];
}

@end
