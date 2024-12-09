import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const coursesRouter = new Hono();

const createCoursesSchema = z.object({
  course_name: z.string().min(1, "course_name is requierd"),
  course_code: z.string().min(1, "course_code is requierd"),
  department_id: z.number().int(),
  description: z.string(),
  is_active: z.boolean().default(true),
});

coursesRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("courses").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

coursesRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("course_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Courses not found" }, 404);

  return c.json(data);
});

coursesRouter.post("/", zValidator("json", createCoursesSchema), async (c) => {
  const courseData = c.req.valid("json");
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("courses")
    .insert(courseData)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

coursesRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase.from("courses").delete().eq("course_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Courses deleted successfully" });
});

export default coursesRouter;
