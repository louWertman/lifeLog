-- Database: LifeLog

--DROP DATABASE IF EXISTS "LifeLog";

--need to use sync token that will be based on time and date to make a unique one each time
--that will be used as the primary key of account info
CREATE DATABASE LifeLog;
BEGIN;

DROP TABLE IF EXISTS account_info;
CREATE TABLE account_info
(
	sync_token varbinary(256) PRIMARY KEY,
	--user_id char(7) primary key,
	--email char(50) NOT NULL,
	--passkey char(50) NOT NULL,
	--first_name char(20),
	--last_name char(20),
	sync bit NOT NULL
	--hashed_pass varbinary(256) NOT NULL
	
);

DROP TABLE IF EXISTS moods;
CREATE TABLE moods
(
	mood_id char(4) primary key,
	description char(20) NOT NULL,
	--user_id char(7) NOT NULL
	sync_token varbinary(256) foreign key
);

DROP TABLE IF EXISTS habit;
CREATE TABLE habit
(
	habit_id char(3) primary key,
	description char(100) NOT NULL,
	negative_habit bit NOT NULL,
	habit_status bit NOT NULL,
	--user_id char(7) NOT NULL
	sync_token varbinary(256) foreign key
);


DROP TABLE IF EXISTS present_habits;
Create TABLE present_habits
(
	entry_id char(7) NOT NULL,
	habit_id char(3) NOT NULL
);

DROP TABLE IF EXISTS entry_info;
CREATE TABLE entry_info
(
	entry_id char(7) primary key,
	entry_date date NOT NULL,
	journal_entry varchar(max),
	mood_id char(4) NOT NULL
	sync_token varbinary(256) foreign key
	
);

--insert into account_info VALUES('lmate01', 'luismateo@example.com','password', 'Luis', 'Mateo', 1);
--insert into account_info VALUES('matel02', 'mateoluis@example.com','passkey', 'Mateo', 'Luis', 0);
--INSERT INTO moods VALUES('1234', 'excited', 'lmate01');
--INSERT INTO moods VALUES('1235', 'sad', 'matel02');
--INSERT INTO habit VALUES('123', 'i keep forgetting to feed the dog at 3 instead of 3:30', 1, 1, 'lmate01');
--INSERT INTO habit VALUES('124', 'i do my work 7 days before its due', 0, 1, 'matel02');
--INSERT INTO entry_info VALUES('100101', '02/26/2025', 'I went out and spent to much time in the store and my dog was upset that i didnt feed it in time', '123');





COMMIT;
