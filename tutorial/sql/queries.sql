-- CREATE TABLE People (
--     ID int NOT NULL AUTO_INCREMENT,
--     LastName varchar(255) NOT NULL,
--     FirstName varchar(255),
--     Address varchar(255),
--     PRIMARY KEY (ID)
-- );

-- INSERT INTO people (FirstName, LastName, Address)
-- VALUES ('Daisy', 'Kim', '55 Main Rd.');

-- select * from people;

-- DROP TABLE jobs;

-- CREATE TABLE jobs (
-- 	id int NOT NULL AUTO_INCREMENT,
--     title varchar(100) NOT NULL,
--     slug varchar(255),
-- 	description varchar(1000) NOT NULL,
--     email varchar(255),
--     address varchar(1000) NOT NULL, 
--     company varchar(255) NOT NULL,
--     industry varchar(255) NOT NULL,
--     jobType varchar(255) NOT NULL,
--     minEducation varchar(255) NOT NULL,
--     positions int,
--     experience varchar(255) NOT NULL,
--     salary int NOT NULL,
--     postingDate varchar(255) NOT NULL,
--     lastDate varchar(255) NOT NULL,
--     applicantApplied varchar(1000),
--     PRIMARY KEY (id)
-- );

-- select * from jobs;

-- update jobs 
-- set title = 'Node Developer'
-- where id = 3;


-- CREATE TABLE user (
-- 	user_id int NOT NULL AUTO_INCREMENT,
--     name varchar(255) NOT NULL,
--     email varchar(255) NOT NULL UNIQUE,
--     role varchar(255) NOT NULL DEFAULT 'user',
--     password varchar(255),
--     createdAt varchar(255),
--     resetPasswordToken varchar(255),
--     resetPasswordExpire date,
--     PRIMARY KEY (user_id)
-- );

-- DROP TABLE user;

select * from user;
select * from jobs;

