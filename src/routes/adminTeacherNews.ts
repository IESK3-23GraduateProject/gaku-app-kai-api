import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const ADMIN_TEST_ID = "1240005";
const TEACHER_TEST_ID = "3240006";

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
  publish_at: z.string().datetime({ message: "Invalid datetime format" }),
  mentioned_user_ids: z.array(z.number()),
});

teacherAdminNewsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const userId = ADMIN_TEST_ID;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  try {
    const { data, error } = await supabase.rpc("get_teacher_admin_news", {
      user_id: userId,
    });

    if (error) {
      throw error;
    }

    return c.json(data);
  } catch (error) {
    console.error("Error fetching teacher admin news:", error);

    return c.json(
      {
        error: error || "An unexpected error occurred",
      },
      500
    );
  }
});

teacherAdminNewsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  if (isNaN(id)) {
    return c.json({ error: "Invalid news ID" }, 400);
  }

  const supabase = createSupabaseClient(c);
  const userId = ADMIN_TEST_ID;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const isTeacher = userId.startsWith("3");
  const isAdmin = userId.startsWith("1");

  if (!isTeacher && !isAdmin) {
    return c.json({ error: "User must be either a teacher or an admin" }, 400);
  }

  try {
    // Fetch the news by ID
    const { data, error } = await supabase.rpc("get_teacher_admin_news_by_id", {
      p_teacher_admin_news_id: id,
      user_id: userId,
    });

    if (error) return c.json({ error: error.message }, 500);
    if (!data) return c.json({ error: "News not found" }, 404);

    // Check if a read status already exists for this user and news ID
    const { data: existingReadStatus, error: fetchError } = await supabase
      .from("teacher_admin_news_reads")
      .select("*")
      .eq(isTeacher ? "teacher_user_id" : "admin_user_id", userId)
      .eq("teacher_admin_news_id", id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.error("Error fetching existing read status:", fetchError);
      return c.json({ error: fetchError.message }, 500);
    }

    // If no existing read status, insert a new one
    if (!existingReadStatus) {
      const insertPayload: Record<string, any> = {
        teacher_admin_news_id: id,
        is_read: true,
        read_at: new Date().toISOString(),
      };

      if (isTeacher) {
        insertPayload.teacher_user_id = userId;
      } else if (isAdmin) {
        insertPayload.admin_user_id = userId;
      }

      const { error: insertError } = await supabase
        .from("teacher_admin_news_reads")
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
    return c.json({ error: error || "Unexpected error occurred" }, 500);
  }
});

teacherAdminNewsRouter.post(
  "/",
  zValidator("json", createTeacherAdminNewsSchema),
  async (c) => {
    const supabase = createSupabaseClient(c);

    try {
      const { mentioned_user_ids, ...newsData } = c.req.valid("json");

      // Step 1: Insert teacher/admin news
      const { data: newsDataResult, error: newsError } = await supabase
        .from("teacher_admin_news")
        .insert(newsData)
        .select()
        .single();

      if (newsError) {
        throw new Error(
          `Error inserting teacher/admin news: ${newsError.message}`
        );
      }

      const teacherAdminNewsId = newsDataResult.teacher_admin_news_id;

      // Step 2: Prepare mentions data
      const mentionsData = mentioned_user_ids.map((userId) => {
        const userIdString = String(userId);

        return {
          teacher_admin_news_id: teacherAdminNewsId,
          teacher_user_id: userIdString.startsWith("3") ? userId : null,
          admin_user_id: userIdString.startsWith("1") ? userId : null,
        };
      });

      // Step 3: Insert mentions
      const { error: mentionsError } = await supabase
        .from("teacher_admin_news_mentions")
        .insert(mentionsData);

      if (mentionsError) {
        // Rollback if mentions insertion fails
        await supabase
          .from("teacher_admin_news")
          .delete()
          .eq("teacher_admin_news_id", teacherAdminNewsId);
        throw new Error(`Error inserting mentions: ${mentionsError.message}`);
      }

      return c.json(
        {
          success: true,
          message: "Teacher/Admin news and mentions created successfully",
          news: newsDataResult,
          mentions: mentionsData,
        },
        201
      );
    } catch (error) {
      console.error("Error creating teacher/admin news with mentions:", error);
      return c.json(
        {
          success: false,
          error: error || "An unexpected error occurred",
        },
        500
      );
    }
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
