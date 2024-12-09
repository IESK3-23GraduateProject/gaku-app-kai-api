import { Context, Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const adminRouter = new Hono();

//Validation Schema
const createAdminSchema = z.object({
  user_name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password too short"),
  date_of_birth: z.string(), //Additional validation might be needed
  employment_status: z.string().optional(),
});

// Get All Teachers
adminRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("admin_users").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

//Get Single Student
adminRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("admin_users")
    .select("*)")
    .eq("admin_user_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "Admin not found" }, 404);

  return c.json(data);
});

// Create Admin
adminRouter.post("/", zValidator("json", createAdminSchema), async (c) => {
  const adminData = c.req.valid("json");
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("admin_users")
    .insert(adminData)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

// Update Admin
adminRouter.put("/:id", zValidator("json", createAdminSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const adminData = c.req.valid("json");
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("admin_users")
    .update(adminData)
    .eq("admin_user_id", id)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

// Delete Admin
adminRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("admin_user_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Admin deleted successfully" });
});

export default adminRouter;
