import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";
import studentRouter from "./students";
import studentNewsRouter from "./studentNews";


const studentNewsMentionsRouter = new Hono();

const createStudentNewsMentionsSchema = z.object({
  student_news_id:z.number(),
  student_user_id:z.number()
});

studentNewsMentionsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("student_news_mentions").select("student_mention_id,student_news(student_news_id,title),student_users(student_user_id,user_name)");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});



studentNewsMentionsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("student_news_mentions")
    .select("student_mention_id,student_news(student_news_id,title),student_users(student_user_id,user_name)")
    .eq("student_user_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Mentions not found" }, 404);

  return c.json(data);
});

studentNewsMentionsRouter.post(
  "/",
  zValidator("json", createStudentNewsMentionsSchema),
  async (c) => {
    const studentNewsMentionsData = c.req.valid("json");
    const supabase = createSupabaseClient(c);

    const { data, error } = await supabase
      .from("student_news_mentions")
      .insert(studentNewsMentionsData)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  }
);

export default studentNewsMentionsRouter
