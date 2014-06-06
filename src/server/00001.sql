  CREATE DATABASE `ChouFleur` /*!40100 DEFAULT CHARACTER SET latin1 */;

  USE `ChouFleur`;

  CREATE TABLE `sample` (
    `sampleUid` varchar(255) NOT NULL,
    `path` text NOT NULL,
    `location_coordinates` varchar(45) DEFAULT NULL,
    `location_accuracy` varchar(45) DEFAULT NULL,
    `sensor_name` varchar(45) DEFAULT NULL,
    `sensor_id` varchar(45) DEFAULT NULL,
    `sample_start_date` varchar(45) DEFAULT NULL,
    `sample_duration` varchar(45) DEFAULT NULL,
    `sample_quality` varchar(45) DEFAULT NULL,
    `sample_average_sound_level` varchar(45) DEFAULT NULL,
    `sample_max_sound_level` varchar(45) DEFAULT NULL,
    `sample_min_sound_level` varchar(45) DEFAULT NULL,
    PRIMARY KEY (`sampleUid`)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;


  CREATE TABLE `sensor` (
    `sensor_id` varchar(36) NOT NULL,
    `sensor_name` varchar(255) NOT NULL,
    PRIMARY KEY (`sensor_id`)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;

  CREATE TABLE `user` (
    `username` varchar(255) NOT NULL,
    `password` varchar(255) NOT NULL,
    PRIMARY KEY (`username`),
    UNIQUE KEY `username_UNIQUE` (`username`)
  ) ENGINE=InnoDB DEFAULT CHARSET=latin1;
