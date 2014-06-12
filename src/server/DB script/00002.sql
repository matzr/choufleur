CREATE TABLE `user_notification_setting` (
  `uns_uid` varchar(45) NOT NULL,
  `uns_type` varchar(45) NOT NULL,
  `uns_details` text,
  `uns_debounce_period_seconds` int(11) NOT NULL DEFAULT '0',
  `user_uid` varchar(45) NOT NULL,
  PRIMARY KEY (`uns_uid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

ALTER TABLE `ChouFleur`.`user` 
ADD COLUMN `user_uid` VARCHAR(45) NOT NULL AFTER `password`,
ADD UNIQUE INDEX `user_uid_UNIQUE` (`user_uid` ASC);

ALTER TABLE `ChouFleur`.`sensor` 
ADD COLUMN `user_uid` VARCHAR(45) NOT NULL AFTER `sensor_name`,
ADD INDEX `idx_sensor_user_uid` (`user_uid` ASC);

ALTER TABLE `ChouFleur`.`user` 
ADD COLUMN `plan` VARCHAR(45) NULL DEFAULT 'FREE' AFTER `user_uid`;

UPDATE ChouFleur.`user` set plan = 'FREE';

ALTER TABLE `ChouFleur`.`user` 
CHANGE COLUMN `plan` `plan` VARCHAR(45) NOT NULL DEFAULT 'FREE' ;
