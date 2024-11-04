-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- Create Tables
CREATE TABLE "users" (
    "user_id" SERIAL PRIMARY KEY,
    "user_name" VARCHAR(255),
    "password" VARCHAR(255),
    "email" VARCHAR(255) UNIQUE,
    "date_of_birth" DATE,
    "role" user_role,
    "department_id" INTEGER,
    "hr_class_id" VARCHAR(255),
    "hire_date" TIMESTAMP,
    "enrollment_date" TIMESTAMP,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "permissions" (
    "permission_id" SERIAL PRIMARY KEY,
    "permission_name" VARCHAR(255) UNIQUE,
    "description" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "role_permissions" (
    "role_permission_id" SERIAL PRIMARY KEY,
    "role" user_role,
    "permission_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("role", "permission_id")
);

CREATE TABLE "departments" (
    "department_id" SERIAL PRIMARY KEY,
    "department_name" VARCHAR(255) UNIQUE,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "courses" (
    "course_id" SERIAL PRIMARY KEY,
    "course_name" VARCHAR(255),
    "course_code" VARCHAR(50) UNIQUE,
    "department_id" INTEGER,
    "description" TEXT,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "hr_classes" (
    "hr_class_id" VARCHAR(255),
    "course_code" INTEGER,
    "department_id" INTEGER,
    "teacher_id" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "news" (
    "news_id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255),
    "publish_at" TIMESTAMP,
    "news_category_id" INTEGER,
    "news_contents" TEXT,
    "author_id" INTEGER,
    "is_public" BOOLEAN,
    "high_priority" BOOLEAN,
    "is_deleted" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "news_categories" (
    "news_category_id" SERIAL PRIMARY KEY,
    "news_category_name" VARCHAR(255) UNIQUE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "mentions" (
    "mention_id" SERIAL PRIMARY KEY,
    "news_id" INTEGER,
    "user_id" INTEGER,
    "group_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "attached_files" (
    "file_id" SERIAL PRIMARY KEY,
    "news_id" INTEGER,
    "file_name" VARCHAR(255),
    "file_path" TEXT,
    "file_type" VARCHAR(100),
    "file_size" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "groups" (
    "group_id" SERIAL PRIMARY KEY,
    "group_name" VARCHAR(255),
    "created_by" INTEGER,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "group_members" (
    "group_member_id" SERIAL PRIMARY KEY,
    "user_id" INTEGER,
    "group_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("group_id", "user_id")
);

CREATE TABLE "news_reads" (
    "news_read_id" SERIAL PRIMARY KEY,
    "news_id" INTEGER,
    "user_id" INTEGER,
    "read_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN DEFAULT true,
    UNIQUE ("user_id", "news_id")
);

CREATE TABLE "school_events" (
    "event_id" SERIAL PRIMARY KEY,
    "title" VARCHAR(255),
    "description" TEXT,
    "location" VARCHAR(255),
    "start_datetime" TIMESTAMP,
    "end_datetime" TIMESTAMP,
    "related_news" INTEGER,
    "is_public" BOOLEAN DEFAULT true,
    "is_cancelled" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Comments
COMMENT ON COLUMN "users"."department_id" IS 'For teachers/admins, null for students';
COMMENT ON COLUMN "users"."hr_class_id" IS 'For students only';
COMMENT ON COLUMN "users"."hire_date" IS 'For teachers/admins only';
COMMENT ON COLUMN "users"."enrollment_date" IS 'For students only';
COMMENT ON COLUMN "permissions"."permission_name" IS 'e.g., create_news, delete_news, view_admin_news';
COMMENT ON COLUMN "hr_classes"."teacher_id" IS 'Only teachers are assigned here';
COMMENT ON COLUMN "news"."author_id" IS 'Author who posted the news';
COMMENT ON COLUMN "news"."is_public" IS 'true: public; false: admin-only';
COMMENT ON COLUMN "news"."high_priority" IS 'use for sorting and filering';
COMMENT ON COLUMN "mentions"."group_id" IS 'Optional: FK to group, null if not applicable';
COMMENT ON COLUMN "groups"."created_by" IS 'Created by either an admin or a teacher';
COMMENT ON COLUMN "news_reads"."is_read" IS 'Can be used to mark as unread';
COMMENT ON COLUMN "school_events"."is_public" IS 'True for public events, false for restricted events';
COMMENT ON COLUMN "school_events"."is_cancelled" IS 'True if the event is cancelled';

-- Add Foreign Keys
ALTER TABLE "users" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "users" ADD FOREIGN KEY ("hr_class_id") REFERENCES "hr_classes" ("hr_class_id");
ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("permission_id");
ALTER TABLE "hr_classes" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "hr_classes" ADD FOREIGN KEY ("teacher_id") REFERENCES "users" ("user_id");
ALTER TABLE "hr_classes" ADD FOREIGN KEY ("course_code") REFERENCES "courses" ("course_id");
ALTER TABLE "courses" ADD FOREIGN KEY ("department_id") REFERENCES "departments" ("department_id");
ALTER TABLE "news" ADD FOREIGN KEY ("news_category_id") REFERENCES "news_categories" ("news_category_id");
ALTER TABLE "news" ADD FOREIGN KEY ("author_id") REFERENCES "users" ("user_id");
ALTER TABLE "mentions" ADD FOREIGN KEY ("news_id") REFERENCES "news" ("news_id");
ALTER TABLE "mentions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");
ALTER TABLE "mentions" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("group_id");
ALTER TABLE "attached_files" ADD FOREIGN KEY ("news_id") REFERENCES "news" ("news_id");
ALTER TABLE "groups" ADD FOREIGN KEY ("created_by") REFERENCES "users" ("user_id");
ALTER TABLE "group_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");
ALTER TABLE "group_members" ADD FOREIGN KEY ("group_id") REFERENCES "groups" ("group_id");
ALTER TABLE "news_reads" ADD FOREIGN KEY ("news_id") REFERENCES "news" ("news_id");
ALTER TABLE "news_reads" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("user_id");
ALTER TABLE "school_events" ADD FOREIGN KEY ("related_news") REFERENCES "news" ("news_id");

-- Create a sequence for the 4-digit part (starting from 0001)
CREATE SEQUENCE student_number_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9999
    CYCLE;

-- Create a function to generate the student ID
CREATE OR REPLACE FUNCTION generate_student_id() 
RETURNS INTEGER AS $$
DECLARE
    year_part TEXT;
    sequence_number TEXT;
    final_id TEXT;
BEGIN
    -- Get current year's last 2 digits
    year_part := to_char(CURRENT_DATE, 'YY');
    
    -- Get next value from sequence and pad with zeros
    sequence_number := lpad(nextval('student_number_seq')::TEXT, 4, '0');
    
    -- Concatenate parts (2 + YY + NNNN)
    final_id := '2' || year_part || sequence_number;
    
    -- Convert to integer and return
    RETURN final_id::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Modify the users table to use the new ID generation for students
ALTER TABLE "users" ALTER COLUMN user_id DROP DEFAULT;
DROP SEQUENCE IF EXISTS users_user_id_seq;


-- To get different IDs for teachers and admins, you can create similar functions:
CREATE SEQUENCE teacher_number_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9999
    CYCLE;

CREATE OR REPLACE FUNCTION generate_teacher_id() 
RETURNS INTEGER AS $$
DECLARE
    year_part TEXT;
    sequence_number TEXT;
    final_id TEXT;
BEGIN
    year_part := to_char(CURRENT_DATE, 'YY');
    sequence_number := lpad(nextval('teacher_number_seq')::TEXT, 4, '0');
    -- Use '3' prefix for teachers
    final_id := '3' || year_part || sequence_number;
    RETURN final_id::INTEGER;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE admin_number_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 1
    MAXVALUE 9999
    CYCLE;

CREATE OR REPLACE FUNCTION generate_admin_id() 
RETURNS INTEGER AS $$
DECLARE
    year_part TEXT;
    sequence_number TEXT;
    final_id TEXT;
BEGIN
    year_part := to_char(CURRENT_DATE, 'YY');
    sequence_number := lpad(nextval('admin_number_seq')::TEXT, 4, '0');
    -- Use '1' prefix for admins
    final_id := '1' || year_part || sequence_number;
    RETURN final_id::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically assign IDs based on role
CREATE OR REPLACE FUNCTION assign_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        CASE NEW.role
            WHEN 'student' THEN
                NEW.user_id := generate_student_id();
            WHEN 'teacher' THEN
                NEW.user_id := generate_teacher_id();
            WHEN 'admin' THEN
                NEW.user_id := generate_admin_id();
        END CASE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER set_user_id
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION assign_user_id();

ALTER TABLE "users" ALTER COLUMN user_id DROP DEFAULT;
