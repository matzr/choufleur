//
//  RegistrationViewController.m
//  ChouFleurClient
//
//  Created by Mathieu Gardere on 13/06/2014.
//  Copyright (c) 2014 Mathieu Gardere. All rights reserved.
//

#import "RegistrationViewController.h"

@interface RegistrationViewController () {
    NSUserDefaults *_userDefaults;
}

@end

@implementation RegistrationViewController

- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil
{
    self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil];
    if (self) {
        // Custom initialization
    }
    return self;
}

- (void)viewDidLoad
{
    [super viewDidLoad];
    _userDefaults = [NSUserDefaults standardUserDefaults];
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

-(void)httpRegistration {
    NSMutableURLRequest *request = [[NSMutableURLRequest alloc] init] ;
    [request setURL:[NSURL URLWithString:[[appdel.baseUrl stringByAppendingString:@"register_sensor_with_token/"] stringByAppendingString:self.tokenTextField.text]]];
    [request setHTTPMethod:@"POST"];
    [request setValue:@"application/x-www-form-urlencoded" forHTTPHeaderField:@"Content-Type"];
    
    NSString *formParams = [NSString stringWithFormat:@"name=%@&longitude=0&latitude=0&accuracy=0", self.sensorNameTextField.text];
    [request setHTTPBody:[formParams dataUsingEncoding:NSUTF8StringEncoding]];
    
    //return and test
    NSData *returnData = [NSURLConnection sendSynchronousRequest:request returningResponse:nil error:nil];
    
    NSDictionary *responseDic = nil;
    
    if (returnData) {
        responseDic = [NSJSONSerialization JSONObjectWithData:returnData options:kNilOptions error:nil];
    }
    
    if (responseDic && [[responseDic objectForKey:@"status"] isEqualToString:@"SUCCESS"]) {
        NSDictionary *sensorDetails = [responseDic objectForKey:@"sensor"];
        
        [_userDefaults setValue:[sensorDetails valueForKey:@"sensor_id"] forKey:@"sensorId"];
        [_userDefaults synchronize];
        
        UIAlertView *alertview = [[UIAlertView alloc] initWithTitle:@"Registration Successful" message:@"Your sensor was registered.\n You can now review your settings and start monitoring" delegate:self cancelButtonTitle:@"OK" otherButtonTitles: nil];
        alertview.tag = 10;
        [alertview show];
    } else {
        [[[UIAlertView alloc] initWithTitle:@"Sensor registration failed" message:[responseDic objectForKey:@"error"] delegate:nil cancelButtonTitle:@"OK" otherButtonTitles:nil] show];
    }
}

- (IBAction)close:(id)sender {
    [self dismissModalViewControllerAnimated:YES];
}

- (IBAction)registerSensor:(id)sender {
    [self.tokenTextField resignFirstResponder];
    [self.sensorNameTextField resignFirstResponder];
    [self moveDown];
    
    if ([self.sensorNameTextField.text isEqualToString:@""]) {
        UIAlertView *alertview = [[UIAlertView alloc] initWithTitle:@"Error" message:@"You need to specify a name for your sensor" delegate:self cancelButtonTitle:@"OK" otherButtonTitles: nil];
        alertview.tag = 20;
        [alertview show];
    } else if ([self.tokenTextField.text isEqualToString:@""]) {
        UIAlertView *alertview = [[UIAlertView alloc] initWithTitle:@"Error" message:@"You need to specify a registration token" delegate:self cancelButtonTitle:@"OK" otherButtonTitles: nil];
        alertview.tag = 30;
        [alertview show];
    } else {
        [self httpRegistration];
    }
}

-(void)moveUp {
    [UIView animateWithDuration:.2 animations:^{
        CGRect frame = self.view.frame;
        frame.origin.y -= 180;
        self.view.frame = frame;
    }];
}

-(void)moveDown {
    [UIView animateWithDuration:.35 animations:^{
        CGRect frame = self.view.frame;
        frame.origin.y = 0;
        self.view.frame = frame;
    }];
}

-(BOOL)textFieldShouldReturn:(UITextField *)textField {
    if (textField == self.tokenTextField) {
        [self moveDown];
    }
    [textField resignFirstResponder];
    return YES;
}

-(BOOL)textFieldShouldBeginEditing:(UITextField *)textField {
    if (textField == self.tokenTextField) {
        [self moveUp];
    }
    return YES;
}

-(void)alertView:(UIAlertView *)alertView didDismissWithButtonIndex:(NSInteger)buttonIndex {
    if (alertView.tag == 10) {
        [self dismissModalViewControllerAnimated:YES];
    } else if (alertView.tag == 20) {
        [self.sensorNameTextField becomeFirstResponder];
    } else if (alertView.tag == 30) {
        [self.tokenTextField becomeFirstResponder];
    }
}
@end
