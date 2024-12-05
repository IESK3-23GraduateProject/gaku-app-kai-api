import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const teacherAdminNewsRouter = new Hono();

const createTeacherAdminNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  news_category_id: z.number(),
  news_contents: z.string().min(1, "Content is required"),
  author_id: z.number(),
  author_type: z.enum(["teacher", "admin"]),
  is_public: z.boolean(),
  high_priority: z.boolean(),
  is_deleted: z.boolean().default(false),
});

teacherAdminNewsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("teacher_admin_news").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

teacherAdminNewsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("teacher_admin_news")
    .select("*")
    .eq("teacher_admin_news_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "News not found" }, 404);

  return c.json(data);
});

teacherAdminNewsRouter.post(
  "/",
  zValidator("json", createTeacherAdminNewsSchema),
  async (c) => {
    const studentData = c.req.valid("json");
    const supabase = createSupabaseClient(c);

    const { data, error } = await supabase
      .from("teacher_admin_news")
      .insert(studentData)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  }
);

teacherAdminNewsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("teacher_admin_news")
    .delete()
    .eq("teacher_admin_news_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Teacher Admin News deleted successfully" });
});

export default teacherAdminNewsRouter;
