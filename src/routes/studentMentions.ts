import { Hono } from "hono";
import { createSupabaseClient } from "../supabaseClient";

const STUDENT_TEST_USER_ID = "2240002";

const studentMentionsRouter = new Hono();

studentMentionsRouter.get("/", async (c) => {
  const userId = STUDENT_TEST_USER_ID;

  const supabase = createSupabaseClient(c);

  try {
    const { data, error } = await supabase.rpc("get_student_news_mentions", {
      p_student_user_id: userId,
    });

    if (error) {
      console.error("Error fetching student news mentions:", error);
      return c.json({ error: error.message }, 500);
    }

    return c.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

studentMentionsRouter.post("/mark-as-read", async (c) => {
  const student_user_id = STUDENT_TEST_USER_ID;

  if (!student_user_id) {
    return c.json({ error: "Student User ID is required" }, 400);
  }

  const supabase = createSupabaseClient(c);

  try {
    // Update all unread mentions for the student
    const { data, error } = await supabase
      .from("student_news_mentions")
      .update({
        is_mention_read: true,
        mention_read_at: new Date().toISOString(),
      })
      .eq("student_user_id", student_user_id)
      .eq("is_mention_read", false);

    if (error) {
      console.error("Error marking mentions as read:", error);
      return c.json({ error: error.message }, 500);
    }

    return c.json({
      success: true,
      message: `mentions marked as read`,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

export default studentMentionsRouter;
