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

  const userId = "3240006";

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const isTeacher = userId.startsWith("3");
  const isAdmin = userId.startsWith("1");

  try {
    let query = supabase
      .from("teacher_admin_news")
      .select(
        `
        *,
        teacher_admin_news_reads (
          is_read,
          read_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (isTeacher) {
      query = query.eq("teacher_admin_news_reads.teacher_user_id", userId);
    }

    if (isAdmin) {
      query = query.eq("teacher_admin_news_reads.admin_user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const response = data.map((news) => ({
      teacher_admin_news_id: news.teacher_admin_news_id,
      title: news.title,
      news_category_id: news.news_category_id,
      news_contents: news.news_contents,
      is_public: news.is_public,
      high_priority: news.high_priority,
      is_deleted: news.is_deleted,
      created_at: news.created_at,
      updated_at: news.updated_at,
      is_read: news.teacher_admin_news_reads?.[0]?.is_read || false,
      read_at: news.teacher_admin_news_reads?.[0]?.read_at || null,
    }));

    return c.json(response);
  } catch (error) {
    console.error("Error fetching teacher admin news:", error);

    return c.json(
      {
        error,
      },
      500
    );
  }
});

teacherAdminNewsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));

  const supabase = createSupabaseClient(c);
  const userId = "3240006";

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const isTeacher = userId.startsWith("3");
  const isAdmin = userId.startsWith("1");

  try {
    const { data, error } = await supabase
      .from("teacher_admin_news")
      .select(
        `
      *,
      teacher_admin_news_reads (
          is_read,
          read_at
        )
      `
      )
      .eq("teacher_admin_news_id", id)
      .single();

    if (error) return c.json({ error: error.message }, 500);

    if (!data) return c.json({ error: "News not found" }, 404);

    const readStatus = data.teacher_admin_news_reads?.[0];

    if (!readStatus) {
      const insertPayload: Record<string, any> = {
        teacher_admin_news_id: id,
        is_read: true,
        read_at: new Date().toISOString(),
      };

      if (isTeacher) {
        insertPayload.teacher_user_id = userId;
      } else if (isAdmin) {
        insertPayload.admin_user_id = userId;
      } else {
        return c.json(
          { error: "User must be either a teacher or an admin" },
          400
        );
      }

      const { error: insertError } = await supabase
        .from("teacher_admin_news_reads")
        .insert(insertPayload);

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
    return c.json({ error }, 500);
  }
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
