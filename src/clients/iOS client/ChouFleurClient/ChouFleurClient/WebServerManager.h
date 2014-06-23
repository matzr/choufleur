//
//  WebServerManager.h
//  SensyCam Sensor
//
//  Created by Mathieu Gardere on 24/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "HTTPServer.h"

@interface WebServerManager : NSObject {
    HTTPServer *httpServer;
}

-(void)startServer;
-(void)stopServer;

@end
