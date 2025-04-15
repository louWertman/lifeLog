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

CREATE TABLE moods
(
	mood_id char(4) primary key,
	description char(20) NOT NULL,
	sync_token varbinary(256),
	foreign key (sync_token) REFERENCES [dbo].[account_info](sync_token)
	); 

	CREATE TABLE habit (
	habit_id char(3) primary key,
	description char(100) NOT NULL,
	negative_habit bit NOT NULL,
	habit_status bit NOT NULL,
	--user_id char(7) NOT NULL
	sync_token varbinary(256),
	foreign key (sync_token) REFERENCES [dbo].[account_info](sync_token)
);
DROP TABLE [dbo].[entry_info]
CREATE TABLE entry_info
(
	entry_id char(7) primary key,
	entry_date date NOT NULL,
	journal_entry varchar(8000),
	mood_id char(4) NOT NULL,
	sync_token varbinary(256) NOT NULL,
	foreign key (sync_token) REFERENCES [dbo].[account_info](sync_token),
	foreign key (mood_id) REFERENCES [dbo].[moods](mood_id)
	
);

Create TABLE present_habits
(
	entry_id char(7) NOT NULL,
	habit_id char(3) NOT NULL,
	foreign key (entry_id) REFERENCES [dbo].[entry_info],
	foreign key (habit_id) REFERENCES [dbo].[habit]
);




-- Insert into account_info
INSERT INTO account_info (sync_token, sync)
VALUES 
(HASHBYTES('SHA2_256', 'user1@email.com'), 1),
(HASHBYTES('SHA2_256', 'user2@email.com'), 0);

-- Insert into moods
INSERT INTO moods (mood_id, description, sync_token)
VALUES 
('H001', 'Happy', HASHBYTES('SHA2_256', 'user1@email.com')),
('S001', 'Sad', HASHBYTES('SHA2_256', 'user2@email.com'));

-- Insert into habit
INSERT INTO habit (habit_id, description, negative_habit, habit_status, sync_token)
VALUES 
('H01', 'Drinking water', 0, 1, HASHBYTES('SHA2_256', 'user1@email.com')),
('H02', 'Smoking', 1, 0, HASHBYTES('SHA2_256', 'user2@email.com'));

-- Insert into entry_info
INSERT INTO entry_info (entry_id, entry_date, journal_entry, mood_id, sync_token)
VALUES 
('E000001', '2025-04-10', 'Felt productive and energized today.', 'H001', HASHBYTES('SHA2_256', 'user1@email.com')),
('E000002', '2025-04-11', 'Had a rough morning but it got better.', 'S001', HASHBYTES('SHA2_256', 'user2@email.com'));

-- Insert into present_habits
INSERT INTO present_habits (entry_id, habit_id)
VALUES 
('E000001', 'H01'),
('E000002', 'H02');
