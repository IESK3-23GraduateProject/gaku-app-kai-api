import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const officialAbsentRouter = new Hono();

const createofficialAbsentSchema = z.object({
  student_user_id:z.number(),
  user_name:z.string(),
  type: z.enum(["web", "on-site"]),
  location: z.enum(["home", "school", "company"]),
  content: z.enum(["info-session", "internship", "test", "interview", "test-intervew", "consult"]),
  company_name: z.string().min(1,"company_name is required"),
  interview_date: z.string().datetime({ message: "Invalid datetime format" }),
  additional_notes: z.string() || null,
});

officialAbsentRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("official_absent_info").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

officialAbsentRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("official_absent_info")
    .select("*")
    .eq("official_absent_info_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "data not found" }, 404);

  return c.json(data);
});

officialAbsentRouter.post("/submit",async (c) => {
  const { userId,uname,companyName,type,location,content,interviewDate,additionalNotes} = await c.req.json();
  if (!userId || !uname || !companyName || !type || !location || !content || !interviewDate) {
    return c.json({ success: false, message: '必須入力です' }, 400);
  }
  const day = new Date(interviewDate);
  console.log('Received data:', { userId,uname,companyName,type,location,content,interviewDate,additionalNotes});
  const supabase = createSupabaseClient(c);
  const { data, error } = await supabase
      .from("official_absent_info")
      .insert({student_user_id:parseInt(userId,10),user_name:uname,company_name:companyName,type:type,location:location,content:content,interviewDate:day.toISOString,additional_notes:additionalNotes})
      .select();

    if (error) return c.json({ success:false, error: error.message,message:"データの送信に失敗しました" }, 500);
    return c.json({success: true ,data, message: "データを送信しました"},201); 
});


officialAbsentRouter.post(
  "",
  zValidator("json", createofficialAbsentSchema),
  async (c) => {
    const officialAbsentData = c.req.valid("json");
    const supabase = createSupabaseClient(c);
    console.log('Received data:', { officialAbsentData });
    const { data, error } = await supabase
      .from("official_absent_info")
      .insert(officialAbsentData)
      .select();

      if (error) return c.json({ success:false, error: error.message,message:error.message }, 500);
      return c.json({success: true ,data, message: "success"},201); 
    
  }
);

officialAbsentRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("official_absent_info")
    .delete()
    .eq("official_absent_info_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Official Absent Info deleted successfully" });
});

export default officialAbsentRouter;
