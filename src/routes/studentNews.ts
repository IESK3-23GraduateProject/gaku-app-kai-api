import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const studentNewsRouter = new Hono();

const createStudentNewsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  news_category_id: z.number(),
  news_contents: z.string().min(1, "Content is required"),
  author_id: z.number(),
  author_type: z.enum(["teacher", "admin"]),
  is_public: z.boolean(),
  high_priority: z.boolean(),
  is_deleted: z.boolean().default(false),
  parson_category:z.string(),
  value:z.number(),
});

studentNewsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);
  const userId = "2240002";

  const { data, error } = await supabase.rpc('get_student_news',{});

  if (error) return c.json({ error: error.message }, 500);

  const result = data.map((item:any)=>({
    ...item,
    is_read: item.read_at !== null
  }))

  return c.json(result);

});

studentNewsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);
  const userId = "2240002";


  const { data, error } = await supabase
    .rpc('get_student_news',{})
    .eq("student_news_id", id)
    .single();
  
  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "News not found" }, 404);

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const { data, error } = await supabase
      .from("student_news")
      .select(
        `
        *,
        student_news_reads (
          is_read,
          read_at
        )
      `
      )
      .eq("student_news_id", id)
      .single();

    if (error) {
      console.error("News fetch error:", error);
      return c.json({ error: error.message }, 500);
    }

    if (!data) {
      return c.json({ error: "News not found" }, 404);
    }

    // Check and insert read status if not exists
    const readStatus = data.student_news_reads?.[0];

    if (!readStatus) {
      const { error: insertError } = await supabase
        .from("student_news_reads")
        .insert({
          student_news_id: id,
          student_user_id: userId,
          is_read: true,
          read_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Insert read status error:", insertError);
        return c.json({ error: insertError.message }, 500);
      }
    }

    const response = {
      ...data,
      is_read: readStatus ? readStatus.is_read : true,
      read_at: readStatus?.read_at || new Date().toISOString(),
    };

    return c.json(response);
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

studentNewsRouter.post(
  "/",
  zValidator("json", createStudentNewsSchema),
  async (c) => {
    const studentData = c.req.valid("json");
    const supabase = createSupabaseClient(c);
    
    const { data, error } = await supabase
      .from("student_news")
      .insert(studentData)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  }
);

studentNewsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("student_news")
    .delete()
    .eq("student_news_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Student News deleted successfully" });
});

export default studentNewsRouter;
