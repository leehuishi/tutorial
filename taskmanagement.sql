-- CREATE DATABASE IF NOT EXISTS `taskmanagement` DEFAULT CHARACTER SET utf8 COLLATE
-- utf8_general_ci;

-- USE `taskmanagement`

-- CREATE TABLE IF NOT EXISTS `accounts` (
-- 	`id` int(11) NOT NULL AUTO_INCREMENT,
-- 	`username` varchar(50) NOT NULL,
-- 	`password` varchar(255) NOT NULL,
-- 	`email` varchar(100) NOT NULL,
-- 	`role` varchar(10) NOT NULL,
--     `status` varchar(10) NOT NULL,
--     `group_id` VARCHAR(255),
--     CONSTRAINT accounts_pk PRIMARY KEY (id)
-- ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ;

-- INSERT INTO `accounts` (`id`, `username`, `password`, `email`) VALUES (1, 'test',
-- 'test', 'test@test.com');


-- ALTER TABLE `accounts` ADD PRIMARY KEY (`id`);

-- ALTER TABLE `accounts` MODIFY `id` int(11) NOT NULL
-- AUTO_INCREMENT,AUTO_INCREMENT=2;

-- DROP TABLE accounts;

select * from accounts;

-- INSERT INTO `accounts` (`username`, `password`, `email`, `role`) VALUES ('John', 'temp1234', 'john.testmail.com', 'admin');
-- INSERT INTO `accounts` (`username`, `password`, `email`, `role`) VALUES ('Joy', 'temp1234', 'joy.testmail.com', 'user');





