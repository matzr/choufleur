CREATE TABLE `ChouFleur`.`user_notification_setting` (
  `uns_uid` VARCHAR(45) NOT NULL,
  `uns_type` VARCHAR(45) NULL,
  `uns_details` TEXT NULL,
  `uns_debounce_period_seconds` INT NULL,
  PRIMARY KEY (`uns_uid`));
