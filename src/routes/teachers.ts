import { Context, Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const teacherRouter = new Hono();

//Validation Schema
const createTeacherSchema = z.object({
  user_name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  date_of_birth: z.string(),
  employment_status: z.string().optional(),
});

// Get All Teachers
teacherRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("teacher_users").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

//Get Single Student
teacherRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("teacher_users")
    .select("*)")
    .eq("teacher_user_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Teacher not found" }, 404);

  return c.json(data);
});

// Create Teacher
teacherRouter.post("/", zValidator("json", createTeacherSchema), async (c) => {
  const teacherData = c.req.valid("json");
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("teacher_users")
    .insert(teacherData)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update Teacher
teacherRouter.put(
  "/:id",
  zValidator("json", createTeacherSchema),
  async (c) => {
    const id = Number(c.req.param("id"));
    const teacherData = c.req.valid("json");
    const supabase = createSupabaseClient(c);

    const { data, error } = await supabase
      .from("teacher_users")
      .update(teacherData)
      .eq("teacher_user_id", id)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data);
  }
);

// Delete Teacher
teacherRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("teacher_users")
    .delete()
    .eq("teacher_user_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Teacher deleted successfully" });
});

export default teacherRouter;
