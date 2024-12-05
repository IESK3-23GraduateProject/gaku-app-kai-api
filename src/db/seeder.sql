-- Seed Departments
INSERT INTO "departments" ("department_name") VALUES 
('Game'),
('IT');

-- Seed Courses
INSERT INTO "courses" ("course_name", "course_code", "department_id", "description") VALUES 
('IT開発エキスパート', 'IE', (SELECT MIN(department_id) FROM departments WHERE department_name = 'IT'), 'IT Development Expert Course'),
('IT開発研究', 'SK', (SELECT MIN(department_id) FROM departments WHERE department_name = 'IT'), 'IT Development Research Course'),
('Webデザインコース', 'WD', (SELECT MIN(department_id) FROM departments WHERE department_name = 'IT'), 'Web Design Course'),
('システムエンジニアコース', 'SE', (SELECT MIN(department_id) FROM departments WHERE department_name = 'IT'), 'System Engineer Course'),
('国際エンジニアコース', 'KE', (SELECT MIN(department_id) FROM departments WHERE department_name = 'IT'), 'International Engineering Course'),
('ゲーム開発エキスパートコース', 'GE', (SELECT MIN(department_id) FROM departments WHERE department_name = 'Game'), 'Game Development Expert Course'),
('ゲームプログラム開発コース', 'GP', (SELECT MIN(department_id) FROM departments WHERE department_name = 'Game'), 'Game Programming Development Course'),
('CGデザインコース', 'CG', (SELECT MIN(department_id) FROM departments WHERE department_name = 'Game'), 'CG Design Course');

-- Seed News Categories
INSERT INTO "news_categories" ("news_category_name") VALUES
('学校からの連絡'),
('担任からの連絡'),
('キャリアセンターより'),
('学校行事'),
('図書館からの連絡'),
('事務局からの連絡'),
('クラブ・サークル'),
('その他');

-- Seed Teacher Users
INSERT INTO "teacher_users" ("user_name", "password", "email", "date_of_birth", "hire_date", "employment_status") VALUES
('John Doe', 'password123', 'jdoe@example.com', '1985-06-15', now(), 'Full-time'),
('Jane Smith', 'password123', 'jsmith@example.com', '1990-02-10', now(), 'Part-time'),
('Michael Brown', 'password123', 'mbrown@example.com', '1978-11-20', now(), 'Full-time'),
('Emily Davis', 'password123', 'edavis@example.com', '1988-04-05', now(), 'Part-time');

-- Seed Admin Users
INSERT INTO "admin_users" ("user_name", "password", "email", "date_of_birth", "hire_date", "employment_status") VALUES
('Admin One', 'admin123', 'admin1@example.com', '1975-03-25', now(), 'Permanent'),
('Admin Two', 'admin123', 'admin2@example.com', '1980-07-20', now(), 'Temporary');

-- Seed HR Classes
INSERT INTO "hr_classes" ("hr_class_id", "course_id", "teacher_id") VALUES
('SK1A', (SELECT MIN(course_id) FROM courses WHERE course_code = 'SK'), (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'John Doe')),
('SK2A', (SELECT MIN(course_id) FROM courses WHERE course_code = 'SK'), (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'Jane Smith')),
('SK3A', (SELECT MIN(course_id) FROM courses WHERE course_code = 'SK'), (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'Michael Brown')),
('IE1A', (SELECT MIN(course_id) FROM courses WHERE course_code = 'IE'), (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'Emily Davis')),
('GE1A', (SELECT MIN(course_id) FROM courses WHERE course_code = 'GE'), (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'John Doe'));

-- Seed Student Users
INSERT INTO "student_users" ("hr_class_id", "user_name", "password", "email", "date_of_birth", "enrollment_date", "enrollment_status") VALUES
((SELECT MIN(hr_class_id) FROM hr_classes WHERE hr_class_id = 'SK1A'), 'Alice Johnson', 'student123', 'alice@example.com', '2005-01-10', now(), 'Active'),
((SELECT MIN(hr_class_id) FROM hr_classes WHERE hr_class_id = 'SK2A'), 'Bob Brown', 'student123', 'bob@example.com', '2006-02-15', now(), 'Active'),
((SELECT MIN(hr_class_id) FROM hr_classes WHERE hr_class_id = 'SK3A'), 'Charlie Davis', 'student123', 'charlie@example.com', '2005-05-20', now(), 'Active'),
((SELECT MIN(hr_class_id) FROM hr_classes WHERE hr_class_id = 'IE1A'), 'Diana White', 'student123', 'diana@example.com', '2004-11-30', now(), 'Active');

-- Seed Student Groups
INSERT INTO "student_groups" ("group_name", "created_by_teacher") VALUES
('SK Study Group', (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'John Doe')),
('Game Dev Team', (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'Jane Smith'));

-- Seed Student Group Members
INSERT INTO "student_group_members" ("student_group_id", "student_user_id") VALUES
((SELECT MIN(student_group_id) FROM student_groups WHERE group_name = 'SK Study Group'), 
 (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Alice Johnson')),
((SELECT MIN(student_group_id) FROM student_groups WHERE group_name = 'SK Study Group'), 
 (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Bob Brown'));

-- Seed Student News
INSERT INTO "student_news" ("title", "publish_at", "news_category_id", "news_contents", "author_id", "author_type", "is_public", "high_priority") VALUES
('Welcome Back!', now(), 
 (SELECT MIN(news_category_id) FROM news_categories WHERE news_category_name = '学校からの連絡'), 
 'Welcome back to the new school year!', 
 (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'John Doe'), 
 'teacher', true, false),
('Upcoming Sports Meet', now(), 
 (SELECT MIN(news_category_id) FROM news_categories WHERE news_category_name = '学校行事'), 
 'Join us for the annual sports meet!', 
 (SELECT MIN(teacher_user_id) FROM teacher_users WHERE user_name = 'Jane Smith'), 
 'teacher', true, true);

-- Seed Teacher/Admin News
INSERT INTO "teacher_admin_news" ("title", "publish_at", "news_category_id", "news_contents", "author_id", "author_type", "is_public", "high_priority") VALUES
('Staff Meeting', now(), 
 (SELECT MIN(news_category_id) FROM news_categories WHERE news_category_name = '事務局からの連絡'), 
 'All staff must attend the monthly meeting.', 
 (SELECT MIN(admin_user_id) FROM admin_users WHERE user_name = 'Admin One'), 
 'admin', false, true);

-- Seed School Events
INSERT INTO "school_events" ("title", "description", "location", "start_datetime", "end_datetime", "is_public") VALUES
('Annual Sports Meet', 'Sports events for students and staff.', 'School Ground', now(), now() + interval '10 hours', true),
('Parent-Teacher Conference', 'Discuss student progress with parents.', 'Main Hall', now() + interval '1 month', now() + interval '1 month' + interval '6 hours', false);

-- Seed News Attachments
INSERT INTO "student_news_attachments" ("student_news_id", "file_name", "file_path", "file_type", "file_size") VALUES
(1, 'welcome_letter.pdf', '/uploads/news/1/welcome_letter.pdf', 'application/pdf', 1024),
(2, 'sports_meet_schedule.pdf', '/uploads/news/2/sports_meet_schedule.pdf', 'application/pdf', 2048);

-- Seed News Mentions and Reads
INSERT INTO "student_news_mentions" ("student_news_id", "student_user_id") VALUES
(1, (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Alice Johnson')),
(1, (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Bob Brown'));

INSERT INTO "student_news_reads" ("student_news_id", "student_user_id") VALUES
(1, (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Alice Johnson')),
(1, (SELECT MIN(student_user_id) FROM student_users WHERE user_name = 'Bob Brown'));
