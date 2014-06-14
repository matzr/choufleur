//
//  RegistrationViewController.h
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import <UIKit/UIKit.h>

@interface RegistrationViewController : UIViewController<UITextFieldDelegate, UIAlertViewDelegate>
- (IBAction)close:(id)sender;
- (IBAction)registerSensor:(id)sender;
@property (weak, nonatomic) IBOutlet UITextField *tokenTextField;
@property (weak, nonatomic) IBOutlet UITextField *sensorNameTextField;

@end
