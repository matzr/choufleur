//
//  AppDelegate.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 21/05/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "AppDelegate.h"
#import "SocketIOPacket.h"
#import "WebServerManager.h"
#include <ifaddrs.h>
#include <arpa/inet.h>


@interface AppDelegate() {
    
}

@property (nonatomic,strong) WebServerManager *webServerManager;

@end

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // Override point for customization after application launch.
    self.webServerManager = [[WebServerManager alloc] init];
    return YES;
}
							
- (void)applicationWillResignActive:(UIApplication *)application
{
    // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
    // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    
    [self closeSocket];
    [self.webServerManager stopServer];
    
    //RESET AUTH TOKEN
    self.authToken = nil;
}

- (void)applicationDidEnterBackground:(UIApplication *)application
{
    // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later. 
    // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
}

- (void)applicationWillEnterForeground:(UIApplication *)application
{
    // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
}

- (void)applicationDidBecomeActive:(UIApplication *)application
{
    [self openSocket];
    [self.webServerManager startServer];
}

- (void)applicationWillTerminate:(UIApplication *)application
{
    // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
}

-(NSString *)serverHost {
//    return @"www.sensycam.com";
//    return @"choufleur.mathieugardere.com";
    return @"localhost";
//    return @"192.168.1.10";
}

-(int)serverPort {
    return 21177;
}

-(NSString *)baseUrl {
    return [NSString stringWithFormat:@"http://%@:%d/", [self serverHost], [self serverPort]];
}


#pragma mark Socket.IO stuff

-(void)openSocket {
    //OPEN THE WEBSOCKET
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    NSString *sensorId = [userDefaults valueForKey:@"sensorId"];
    if (sensorId != nil) {
        socketIO = [[SocketIO alloc] initWithDelegate:self];
        [socketIO connectToHost:[self serverHost] onPort:[self serverPort]];
        [socketIO sendEvent:@"sensor_online" withData:sensorId];
    }
}

-(void)closeSocket {
    if (socketIO) {
        [socketIO disconnect];
    }
}


- (void) socketIO:(SocketIO *)socket didReceiveMessage:(SocketIOPacket *)packet {
}

- (void) socketIO:(SocketIO *)socket didReceiveJSON:(SocketIOPacket *)packet {
    
}

- (void) socketIO:(SocketIO *)socket didReceiveEvent:(SocketIOPacket *)packet {
    if ([packet.name isEqualToString:@"local_ip"]) {
        //TODO: detect and return local ip
        [socketIO sendEvent:@"local_ip" withData:[self getIPAddress]];
    } else if ([packet.name isEqualToString:@"auth_token"]) {
        if (!self.authToken) {
            NSString *uuid = [[NSUUID UUID] UUIDString];
            self.authToken = uuid;
        }
        [socketIO sendEvent:@"auth_token" withData:self.authToken];
    }
}

- (void) socketIO:(SocketIO *)socket didSendMessage:(SocketIOPacket *)packet {
    
}

- (void) socketIO:(SocketIO *)socket onError:(NSError *)error {
    
}


- (NSString *)getIPAddress
{
    NSString *address = @"error";
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = 0;
    
    // retrieve the current interfaces - returns 0 on success
    success = getifaddrs(&interfaces);
    if (success == 0) {
        // Loop through linked list of interfaces
        temp_addr = interfaces;
        while (temp_addr != NULL) {
            if( temp_addr->ifa_addr->sa_family == AF_INET) {
                // Check if interface is en0 which is the wifi connection on the iPhone
                if ([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
                    // Get NSString from C String
                    address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
                }
            }
            
            temp_addr = temp_addr->ifa_next;
        }
    }
    
    // Free memory
    freeifaddrs(interfaces);
    
    return address;
}

@end
