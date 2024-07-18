-- --------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `app` (
--     `app_acronym` varchar(255) NOT NULL,
--     `app_description` text,
--     `app_rnumber` int NOT NULL,
--     `app_startdate` date NOT NULL,
--     `app_enddate` date NOT NULL,
--     `app_permit_create` varchar(255),
--     `app_permit_open` varchar(255),
--     `app_permit_todolist` varchar(255),
--     `app_permit_doing` varchar(255),
--     `app_permit_done` varchar(255),
--     CONSTRAINT app_pk PRIMARY KEY (app_acronym),
--     FOREIGN KEY (app_permit_create) REFERENCES tms_grp(groupname),
--     FOREIGN KEY (app_permit_open) REFERENCES tms_grp(groupname),
--     FOREIGN KEY (app_permit_todolist) REFERENCES tms_grp(groupname),
--     FOREIGN KEY (app_permit_doing) REFERENCES tms_grp(groupname),
--     FOREIGN KEY (app_permit_done) REFERENCES tms_grp(groupname)
-- );

-- DROP TABLE app;

--------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `plan` (
--     `plan_mvp_name` varchar(255) NOT NULL,
--     `plan_startdate` date NOT NULL,
--     `plan_endDate` date NOT NULL,
--     `plan_app_acronym` varchar(255) NOT NULL,
--     CONSTRAINT plan_pk PRIMARY KEY (plan_mvp_name, plan_app_acronym),
--     FOREIGN KEY (plan_app_acronym) REFERENCES app(app_acronym)
-- );

-- DROP TABLE plan;

-- --------------------------------------------------------
-- CREATE TABLE IF NOT EXISTS `task` (
--     `task_name` varchar(255) NOT NULL,
--     `task_description` text,
--     `task_notes` longtext,
--     `task_id` varchar(255) NOT NULL,
--     `task_plan` varchar(255),
--     `task_app_acronym` varchar(255) NOT NULL,
--     `task_state` ENUM('open', 'todo', 'doing', 'done', 'closed') NOT NULL,
--     `task_creator` varchar(255) NOT NULL,
--     `task_owner` varchar(255) NOT NULL,
--     `task_createdate` date NOT NULL,
--     CONSTRAINT task_pk PRIMARY KEY (task_id),
--     FOREIGN KEY (task_app_acronym) REFERENCES app(app_acronym),
--     FOREIGN KEY (task_creator) REFERENCES tms_users(username),
--     FOREIGN KEY (task_owner) REFERENCES tms_users(username)
-- );

-- DROP TABLE task;

select * from app;

delete from app where app_acronym not in ('zoo');

select * from plan;

select * from task where task_id = "zoo_45";


select app_permit_todo  from app where app_acronym = 'zoo';


UPDATE app SET app_rnumber = 2 WHERE app_acronym = 'zoo';

SELECT task_notes FROM task WHERE task_id = "zoo_37";

select * from task where task_app_acronym = "zoo" order by task_id desc;


select username from tms_usergroups where groupname = 'zoodone';

select email from tms_users where username in (select username from tms_usergroups where groupname = 'zoodone');


select * from app;
select * from plan;
select * from task;

UPDATE task SET task_state = 'doing', task_owner = 'test' where task_id = 'zoo_45'

