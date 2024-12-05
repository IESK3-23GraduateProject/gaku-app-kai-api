-- Create the author_role ENUM type
CREATE TYPE author_role AS ENUM ('teacher', 'admin');

CREATE TABLE "student_users" (
  "student_user_id" SERIAL PRIMARY KEY,
  "hr_class_id" VARCHAR,
  "user_name" TEXT,
  "password" TEXT,
  "email" TEXT UNIQUE,
  "date_of_birth" DATE,
  "enrollment_date" TIMESTAMP,
  "enrollment_status" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_users" (
  "teacher_user_id" SERIAL PRIMARY KEY,
  "user_name" TEXT,
  "password" TEXT,
  "email" TEXT UNIQUE,
  "date_of_birth" DATE,
  "hire_date" TIMESTAMP,
  "employment_status" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "admin_users" (
  "admin_user_id" SERIAL PRIMARY KEY,
  "user_name" TEXT,
  "password" TEXT,
  "email" TEXT UNIQUE,
  "date_of_birth" DATE,
  "hire_date" TIMESTAMP,
  "employment_status" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "departments" (
  "department_id" SERIAL PRIMARY KEY,
  "department_name" TEXT UNIQUE,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "hr_classes" (
  "hr_class_id" VARCHAR PRIMARY KEY,
  "course_id" INT,
  "teacher_id" INT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "courses" (
  "course_id" SERIAL PRIMARY KEY,
  "course_name" TEXT,
  "course_code" TEXT UNIQUE,
  "department_id" INT,
  "description" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "student_news" (
  "student_news_id" SERIAL PRIMARY KEY,
  "title" TEXT,
  "publish_at" TIMESTAMP,
  "news_category_id" INT,
  "news_contents" TEXT,
  "author_id" INT,
  "author_type" author_role,
  "is_public" BOOLEAN,
  "high_priority" BOOLEAN,
  "is_deleted" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_admin_news" (
  "teacher_admin_news_id" SERIAL PRIMARY KEY,
  "title" TEXT,
  "publish_at" TIMESTAMP,
  "news_category_id" INT,
  "news_contents" TEXT,
  "author_id" INT,
  "author_type" author_role,
  "is_public" BOOLEAN,
  "high_priority" BOOLEAN,
  "is_deleted" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "student_news_mentions" (
  "student_mention_id" SERIAL PRIMARY KEY,
  "student_news_id" INT,
  "student_user_id" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_admin_news_mentions" (
  "teacher_admin_mention_id" SERIAL PRIMARY KEY,
  "teacher_admin_news_id" INT,
  "teacher_user_id" INT,
  "admin_user_id" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "student_news_reads" (
  "student_news_read_id" SERIAL PRIMARY KEY,
  "student_news_id" INT,
  "student_user_id" INT,
  "read_at" TIMESTAMP DEFAULT NULL,
  "is_read" BOOLEAN DEFAULT true
);

CREATE TABLE "teacher_admin_news_reads" (
  "teacher_admin_news_read_id" SERIAL PRIMARY KEY,
  "teacher_admin_news_id" INT,
  "teacher_user_id" INT,
  "admin_user_id" INT,
  "read_at" TIMESTAMP DEFAULT NULL,
  "is_read" BOOLEAN DEFAULT true
);

CREATE TABLE "student_news_attachments" (
  "file_id" SERIAL PRIMARY KEY,
  "student_news_id" INT,
  "file_name" TEXT,
  "file_path" TEXT,
  "file_type" TEXT,
  "file_size" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_admin_news_attachments" (
  "file_id" SERIAL PRIMARY KEY,
  "teacher_admin_news_id" INT,
  "file_name" TEXT,
  "file_path" TEXT,
  "file_type" TEXT,
  "file_size" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "news_categories" (
  "news_category_id" SERIAL PRIMARY KEY,
  "news_category_name" TEXT UNIQUE,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "student_groups" (
  "student_group_id" SERIAL PRIMARY KEY,
  "group_name" TEXT,
  "created_by_teacher" INT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "student_group_members" (
  "student_group_member_id" SERIAL PRIMARY KEY,
  "student_group_id" INT,
  "student_user_id" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_admin_groups" (
  "teacher_admin_group_id" SERIAL PRIMARY KEY,
  "group_name" TEXT,
  "created_by_admin" INT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "teacher_admin_group_members" (
  "teacher_admin_group_member_id" SERIAL PRIMARY KEY,
  "teacher_admin_group_id" INT,
  "teacher_user_id" INT,
  "admin_user_id" INT,
  "created_at" TIMESTAMP DEFAULT now()
);

CREATE TABLE "school_events" (
  "event_id" SERIAL PRIMARY KEY,
  "title" TEXT,
  "description" TEXT,
  "location" TEXT,
  "start_datetime" TIMESTAMP,
  "end_datetime" TIMESTAMP,
  "related_news_url" TEXT,
  "is_public" BOOLEAN DEFAULT true,
  "is_cancelled" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

-- Create unique indexes
CREATE UNIQUE INDEX ON "student_news_reads" ("student_user_id", "student_news_id");
CREATE UNIQUE INDEX ON "teacher_admin_news_reads" ("teacher_user_id", "teacher_admin_news_id");
CREATE UNIQUE INDEX ON "teacher_admin_news_reads" ("admin_user_id", "teacher_admin_news_id");
CREATE UNIQUE INDEX ON "student_group_members" ("student_group_id", "student_user_id");
CREATE UNIQUE INDEX ON "teacher_admin_group_members" ("teacher_admin_group_id", "teacher_user_id");
CREATE UNIQUE INDEX ON "teacher_admin_group_members" ("teacher_admin_group_id", "admin_user_id");

-- Add comments
COMMENT ON COLUMN "student_users"."enrollment_status" IS '在学状態';
COMMENT ON COLUMN "teacher_users"."employment_status" IS '雇用形態';
COMMENT ON COLUMN "admin_users"."employment_status" IS '雇用形態';
COMMENT ON COLUMN "student_news"."author_id" IS 'teacher_user_id/admin_user_id のみ';
COMMENT ON COLUMN "student_news"."author_type" IS 'author_id が teacher_users または admin_users をどちらを参照しているかどうかを示す';
COMMENT ON COLUMN "student_news"."is_public" IS 'true: すべての生徒に表示。false: 指定された生徒/グループのみに表示';
COMMENT ON COLUMN "student_news"."high_priority" IS 'true:優先度が高い false:普通';
COMMENT ON COLUMN "teacher_admin_news"."author_id" IS 'teacher_user_id/admin_user_id のみ';
COMMENT ON COLUMN "teacher_admin_news"."author_type" IS 'author_id が teacher_users または admin_users をどちらを参照しているかどうかを示す';
COMMENT ON COLUMN "teacher_admin_news"."is_public" IS 'true: すべての教師/管理者に表示 false: 指定されたユーザー/グループのみに表示';
COMMENT ON COLUMN "teacher_admin_news"."high_priority" IS 'use for sorting and filtering';
COMMENT ON COLUMN "student_news_mentions"."student_user_id" IS 'Snapshot of individual group member at mention time';
COMMENT ON COLUMN "teacher_admin_news_mentions"."teacher_user_id" IS 'Snapshot of individual group member at mention time';
COMMENT ON COLUMN "teacher_admin_news_mentions"."admin_user_id" IS 'Snapshot of individual group member at mention time';
COMMENT ON COLUMN "student_news_reads"."is_read" IS 'Can be used to mark as unread';
COMMENT ON COLUMN "teacher_admin_news_reads"."teacher_user_id" IS 'Optional: for teacher reads';
COMMENT ON COLUMN "teacher_admin_news_reads"."admin_user_id" IS 'Optional: for admin reads';
COMMENT ON COLUMN "teacher_admin_news_reads"."is_read" IS 'Can be used to mark as unread';
COMMENT ON COLUMN "teacher_admin_group_members"."teacher_user_id" IS 'Optional: for teacher members';
COMMENT ON COLUMN "teacher_admin_group_members"."admin_user_id" IS 'Optional: for admin members';
COMMENT ON COLUMN "school_events"."is_public" IS 'True for public events, false for restricted events';
COMMENT ON COLUMN "school_events"."is_cancelled" IS 'True if the event is cancelled';

-- Add Foreign Key Constraints
ALTER TABLE "student_users" ADD FOREIGN KEY ("hr_class_id") REFERENCES "hr_classes" ("hr_class_id");
ALTER TABLE "hr_classes" ADD FOREIGN KEY ("course_id") REFERENCES "courses" ("course_id");
ALTER TABLE "hr_classes" ADD FOREIGN KEY ("teacher_id") REFERENCES "teacher_users" ("teacher_user_id");
ALTER TABLE "courses" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "student_news" ADD FOREIGN KEY ("news_category_id") REFERENCES "news_categories" ("news_category_id");
ALTER TABLE "teacher_admin_news" ADD FOREIGN KEY ("news_category_id") REFERENCES "news_categories" ("news_category_id");
ALTER TABLE "student_news_mentions" ADD FOREIGN KEY ("student_news_id") REFERENCES "student_news" ("student_news_id");
ALTER TABLE "student_news_mentions" ADD FOREIGN KEY ("student_user_id") REFERENCES "student_users" ("student_user_id");
ALTER TABLE "teacher_admin_news_mentions" ADD FOREIGN KEY ("teacher_admin_news_id") REFERENCES "teacher_admin_news" ("teacher_admin_news_id");
ALTER TABLE "teacher_admin_news_mentions" ADD FOREIGN KEY ("teacher_user_id") REFERENCES "teacher_users" ("teacher_user_id");
ALTER TABLE "teacher_admin_news_mentions" ADD FOREIGN KEY ("admin_user_id") REFERENCES "admin_users" ("admin_user_id");
ALTER TABLE "student_news_reads" ADD FOREIGN KEY ("student_news_id") REFERENCES "student_news" ("student_news_id");
ALTER TABLE "student_news_reads" ADD FOREIGN KEY ("student_user_id") REFERENCES "student_users" ("student_user_id");
ALTER TABLE "teacher_admin_news_reads" ADD FOREIGN KEY ("teacher_admin_news_id") REFERENCES "teacher_admin_news" ("teacher_admin_news_id");
ALTER TABLE "teacher_admin_news_reads" ADD FOREIGN KEY ("teacher_user_id") REFERENCES "teacher_users" ("teacher_user_id");
ALTER TABLE "teacher_admin_news_reads" ADD FOREIGN KEY ("admin_user_id") REFERENCES "admin_users" ("admin_user_id");
ALTER TABLE "student_news_attachments" ADD FOREIGN KEY ("student_news_id") REFERENCES "student_news" ("student_news_id");
ALTER TABLE "teacher_admin_news_attachments" ADD FOREIGN KEY ("teacher_admin_news_id") REFERENCES "teacher_admin_news" ("teacher_admin_news_id");
ALTER TABLE "student_groups" ADD FOREIGN KEY ("created_by_teacher") REFERENCES "teacher_users" ("teacher_user_id");
ALTER TABLE "student_group_members" ADD FOREIGN KEY ("student_group_id") REFERENCES "student_groups" ("student_group_id");
ALTER TABLE "student_group_members" ADD FOREIGN KEY ("student_user_id") REFERENCES "student_users" ("student_user_id");
ALTER TABLE "teacher_admin_groups" ADD FOREIGN KEY ("created_by_admin") REFERENCES "admin_users" ("admin_user_id");
ALTER TABLE "teacher_admin_group_members" ADD FOREIGN KEY ("teacher_admin_group_id") REFERENCES "teacher_admin_groups" ("teacher_admin_group_id");
ALTER TABLE "teacher_admin_group_members" ADD FOREIGN KEY ("teacher_user_id") REFERENCES "teacher_users" ("teacher_user_id");
ALTER TABLE "teacher_admin_group_members" ADD FOREIGN KEY ("admin_user_id") REFERENCES "admin_users" ("admin_user_id");
