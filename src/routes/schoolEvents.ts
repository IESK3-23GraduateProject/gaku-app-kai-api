import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const schoolEventsRouter = new Hono();

const createschoolEventsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "description is required"),
  location: z.string().min(1, "location is required"),
  related_news_url: z.string(),
  is_public: z.boolean().default(true),
  is_cancelled: z.boolean().default(false),
});

schoolEventsRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("school_events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

schoolEventsRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("school_events")
    .select("*")
    .eq("event_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Events not found" }, 404);

  return c.json(data);
});

schoolEventsRouter.post(
  "/",
  zValidator("json", createschoolEventsSchema),
  async (c) => {
    const schoolEventsData = c.req.valid("json");
    const supabase = createSupabaseClient(c);

    const { data, error } = await supabase
      .from("school_events")
      .insert(schoolEventsData)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data, 201);
  }
);

schoolEventsRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("school_events")
    .delete()
    .eq("event_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "School Events deleted successfully" });
});

export default schoolEventsRouter;
