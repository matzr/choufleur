//
//  AppDelegate.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 21/05/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>

#define appdel ((AppDelegate *)[[UIApplication sharedApplication] delegate])

@interface AppDelegate : UIResponder <UIApplicationDelegate>


@property (strong, nonatomic) UIWindow *window;

@property (strong, readonly) NSString *baseUrl;

@end
