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
  date_of_birth: z.string(), // Additional validation might be needed
  enrollment_status: z.string().optional(),
});

// Get All Students
studentRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("student_users").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Get Single Student
studentRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("student_users")
    .select("*)")
    .eq("student_user_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Student not found" }, 404);

  return c.json(data);
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

export default studentRouter;
