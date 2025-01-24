import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const studentRouter = new Hono();

// Validation Schema
const createStudentSchema = z.object({
  hr_class_id: z.string(),
  user_name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  date_of_birth: z.string(),
  enrollment_status: z.string().optional(),
});

studentRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const departmentName = c.req.query("department_name") || null;
  const courseCode = c.req.query("course_code") || null;
  const hrClassIdParam = c.req.query("hr_class_id") || null;

  // Convert to arrays for `course_filter` and `hr_classes_filter`
  const courseCodeFilter = courseCode ? courseCode.split(",") : null;
  const hrClassesFilter = hrClassIdParam ? hrClassIdParam.split(",") : null;

  // Call the Supabase RPC function
  const { data, error } = await supabase.rpc("get_student_users", {
    department_filter: departmentName,
    course_filter: courseCodeFilter,
    hr_classes_filter: hrClassesFilter,
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

// Get Single Student
studentRouter.get("/:id", async (c) => {
  const supabase = createSupabaseClient(c);
  const studentId = c.req.param("id");

  const { data, error } = await supabase.rpc("get_student_user_by_id", {
    student_id: parseInt(studentId, 10),
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

// Create Student
studentRouter.post("/", zValidator("json", createStudentSchema), async (c) => {
  const studentData = c.req.valid("json");
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("student_users")
    .insert(studentData)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update Student
studentRouter.put(
  "/:id",
  zValidator("json", createStudentSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const studentData = c.req.valid("json");
    const supabase = createSupabaseClient(c);

    const { data, error } = await supabase
      .from("student_users")
      .update(studentData)
      .eq("student_user_id", id)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

// Delete Student
studentRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("student_users")
    .delete()
    .eq("student_user_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Student deleted successfully" });
});

studentRouter.get("/hr-class/:id", async (c) => {
  const supabase = createSupabaseClient(c);
  const hrClassId = c.req.param("id");

  const { data, error } = await supabase
    .from("student_users")
    .select("student_user_id")
    .eq("hr_class_id", hrClassId);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

export default studentRouter;
