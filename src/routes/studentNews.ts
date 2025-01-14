import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const STUDENT_TEST_USER_ID = "2240002";

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
  parson_category: z.string(),
  value: z.number(),
});

studentNewsRouter.get("/", async (c) => {
  try {
    const supabase = createSupabaseClient(c);
    const userId = STUDENT_TEST_USER_ID;

    const { data, error } = await supabase.rpc("get_student_news", {
      p_student_user_id: userId,
    });

    if (error) {
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error("Error fetching student news:", error);

    return c.json(
      {
        error: error || "An unexpected error occurred",
      },
      500
    );
  }
});

studentNewsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid news ID" }, 400);
  }

  const supabase = createSupabaseClient(c);
  const userId = STUDENT_TEST_USER_ID;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const { data, error } = await supabase.rpc("get_student_news_by_id", {
      p_student_news_id: id,
      p_student_user_id: userId,
    });

    if (error) return c.json({ error: error.message }, 500);
    if (!data) return c.json({ error: "News not found" }, 404);

    // Check if a read status already exists for this student and news ID
    const { data: existingReadStatus, error: fetchError } = await supabase
      .from("student_news_reads")
      .select("*")
      .eq("student_user_id", userId)
      .eq("student_news_id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing read status:", fetchError);
      return c.json({ error: fetchError.message }, 500);
    }

    // If no existing read status, insert a new one
    if (!existingReadStatus) {
      const insertPayload = {
        student_news_id: id,
        student_user_id: userId,
        is_read: true,
        read_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase
        .from("student_news_reads")
        .insert(insertPayload);

      if (insertError) {
        console.error("Insert read status error:", insertError);
        return c.json({ error: insertError.message }, 500);
      }

      // Update response with new read status
      data.is_read = true;
      data.read_at = insertPayload.read_at;
    } else {
      // Existing read status found, use it in the response
      data.is_read = existingReadStatus.is_read;
      data.read_at = existingReadStatus.read_at;
    }

    return c.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: error || "An unexpected error occurred" }, 500);
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
