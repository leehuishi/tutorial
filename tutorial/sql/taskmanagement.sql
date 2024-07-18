-- CREATE DATABASE IF NOT EXISTS `taskmanagement` DEFAULT CHARACTER SET utf8 COLLATE
-- utf8_general_ci;

-- USE `taskmanagement`
-- ------------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `tms_users` (
-- 	`username` varchar(255) NOT NULL,
-- 	`password` varchar(255) NOT NULL,
-- 	`email` varchar(255),
--     `status` BOOLEAN DEFAULT TRUE,
--     CONSTRAINT tms_users_pk PRIMARY KEY (username)
-- ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ;

-- DROP TABLE tms_users;

-- select * from tms_users;

-- ----------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `tms_grp` (
-- 	`groupname` varchar(255) NOT NULL,
--     CONSTRAINT tms_grp_pk PRIMARY KEY (groupname)
-- ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8 ;

-- DROP TABLE tms_grp;

-- select * from tms_grp;
-- --------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `tms_usergroups` (
--     `username` varchar(255) NOT NULL,
--     `groupname` varchar(255) NOT NULL,
--     CONSTRAINT tms_usergroups_pk PRIMARY KEY (username, groupname),
--     FOREIGN KEY (username) REFERENCES tms_users(username),
--     FOREIGN KEY (groupname) REFERENCES tms_grp(groupname)
-- );

-- DROP TABLE tms_usergroups;

select * from tms_usergroups; 

select * from tms_grp;

select * from tms_users;

insert into tms_grp (groupname) value ('project_lead');

insert into tms_usergroups (username, groupname) value ('test', 'admin');
insert into tms_usergroups (username, groupname) value ('test', 'project_lead');

-- admin, super admin, project lead, project manager, zoo_dev1

-- SELECT * FROM tms_usergroups WHERE username = 'joy';



SELECT groupname FROM tms_usergroups WHERE username = "superadmin";

select groupname from tms_usergroups where username="test" and groupname not in ("project lead", "admin");

UPDATE tms_users 
SET password = "", email = "", status = 0 
where username = "";


SELECT groupname FROM tms_usergroups WHERE username = 'Gill';

SELECT groupname FROM tms_usergroups WHERE username = "test" and groupname in ("admin", "super_admin");

select * from tms_grp;

delete from tms_usergroups where username not in ("admin", "test");
delete from tms_grp where groupname not in ("admin", "project lead");

delete from tms_users where username not in ("admin", "test");

select * from tms_usergroups;

select * from tms_users;

select * from tms_grp;


delete from tms_group where groupname = "project lead";


