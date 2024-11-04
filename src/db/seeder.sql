INSERT INTO "departments" ("department_name") VALUES ('Game'),('IT');

-- Insert Courses
INSERT INTO  "courses" ("course_name","course_code","department_id","description") VALUES
("IT開発エキスパート","IE",2,NULL),
("IT開発研究","SK",2,NULL),
("Webデザインコース","WD",2,NULL),
("システムエンジニアコース","SE",2,NULL),
("国際エンジニアコース","KE",2,NULL),
("ゲーム開発エキスパートコース","GE",1,NULL),
("ゲームプログラム開発コース","GP",1,NULL),
("CGデザインコース","CG",1,NULL),

-- Insert Permissions
INSERT INTO "permissions" ("permission_name", "description") VALUES
('create_news', 'Permission to create news articles'),
('delete_news', 'Permission to delete news articles'),
('view_admin_news', 'Permission to view admin-only news');

-- Insert Role Permissions
INSERT INTO "role_permissions" ("role", "permission_id") VALUES
('teacher', 1),
('teacher', 2),
('teacher', 3),
('admin', 1),
('admin', 2),
('admin', 3);


-- Insert Users 
INSERT INTO "users" ("user_name", "password", "email", "date_of_birth", "role", "department_id", "hire_date", "is_active") VALUES
('Alice Smith', 'hashed_password', 'alice@school.edu', '1985-04-12', 'teacher', 1, '2010-09-01', true),
('Bob Brown', 'hashed_password', 'bob@school.edu', '1975-05-20', 'admin', NULL, '2005-09-01', true),
('Charlie Johnson', 'hashed_password', 'charlie@school.edu', '2000-09-15', 'student', NULL, NULL, true);

-- Insert HR Classes
INSERT INTO "hr_classes" ("hr_class_id", "department_id", "course_code",'teacher_id') VALUES
('SK1A', 2, "SK", NULL),
('SK2A', 2, "SK", NULL),
('SK3A', 2, "SK", NULL),
('SK1B', 2, "SK", NULL),
('SK2B', 2, "SK", NULL),
('SK3B', 2, "SK", NULL),
('IE1A', 2, "IE", NULL),
('IE2A', 2, "IE", NULL),
('IE3A', 2, "IE", NULL),
('IE4A', 2, "IE", NULL),
('IE1B', 2, "IE", NULL),
('IE2B', 2, "IE", NULL),
('IE3B', 2, "IE", NULL),
('IE4B', 2, "IE", NULL),

-- Insert News Categories
INSERT INTO "news_categories" ("news_category_name") VALUES
('全てのお知らせ'),
('学校からの連絡'),
('担任からの連絡'),
('キャリアセンターより'),
('学校行事'),
('図書館からの連絡'),
('事務局からの連絡'),
('クラブ・サークル'),
('その他'),

-- Insert News FIX ID Later
INSERT INTO "news" ("title", "news_contents", "news_category_id", "publish_at", "author_id", "is_public", "high_priority", "is_deleted") VALUES
('【キャリアセンター】求人情報プリント発行します(8/26発行）', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = 'キャリアセンターより'), '2024-10-27', 1, true, false, false),
('【キャリアセンター】8/10（土）～8/20（火）はお休みです', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = 'キャリアセンターより'), '2024-10-27', 1, true, false, false),
('学校休館期間・先生の出勤のお知らせ', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false),
('「外国人留学生の滞在に伴う家族等の渡日状況アンケート調査」への協力のお願い', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = 'その他'), '2024-10-27', 1, true, false, false),
('TOEICの問題集を図書室に置きました', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '図書館からの連絡'), '2024-10-27', 1, true, false, false),
('学年混合ゲーム制作イベントGameIndustriesJamを学生主体で開催！', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false),
('ピアスッタフ募集！！', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false),
('夏期選択講座 受講許可一覧', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false),
('保健室・学生相談室だより【夏号】', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false),
('近隣のマンションから苦情がきています。', 'Explore alternatives to MongoDB Realm and learn how Supabase provides powerful solutions for device synchronization and real-time database capabilities.', (SELECT "news_category_id" FROM "news_categories" WHERE "news_category_name" = '学校からの連絡'), '2024-10-27', 1, true, false, false);
