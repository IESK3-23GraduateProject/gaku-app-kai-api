import { Hono } from "hono";
import { createSupabaseClient } from "../supabaseClient";

const TEACHER_TEST_USER_ID = "3240007";
const ADMIN_TEST_USER_ID = "1240002";

const teacherMentionsRouter = new Hono();

// Fetch teacher/admin news mentions
teacherMentionsRouter.get("/", async (c) => {
  const userId = TEACHER_TEST_USER_ID;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const supabase = createSupabaseClient(c);

  try {
    // Call the RPC function to get mentions
    const { data, error } = await supabase.rpc(
      "get_teacher_admin_news_mentions",
      {
        p_user_id: userId,
      }
    );

    if (error) {
      console.error("Error fetching teacher/admin news mentions:", error);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

// Mark all teacher/admin mentions as read
teacherMentionsRouter.post("/mark-as-read", async (c) => {
  const userId = TEACHER_TEST_USER_ID;

  if (!userId) {
    return c.json({ error: "User ID is required" }, 400);
  }

  const supabase = createSupabaseClient(c);

  try {
    // Update all unread mentions for the teacher/admin
    const { data, error } = await supabase
      .from("teacher_admin_news_mentions")
      .update({
        is_mention_read: true,
        mention_read_at: new Date().toISOString(),
      })
      .or(`teacher_user_id.eq.${userId},admin_user_id.eq.${userId}`) // Matches either teacher or admin
      .eq("is_mention_read", false);

    if (error) {
      console.error("Error marking mentions as read:", error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({
      success: true,
      message: `Mentions marked as read`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

export default teacherMentionsRouter;
