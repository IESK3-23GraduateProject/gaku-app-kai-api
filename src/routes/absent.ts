import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const absentRouter = new Hono();

const createAbsentSchema = z.object({
  day_off: z.string().datetime({ message: "Invalid datetime format" }),
  select_type: z.enum(["absent", "late", "train_delay", "leaving_early"]),
  reason: z.string(),
});

absentRouter.get("/", async (c) => {
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase.from("absent_info").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

absentRouter.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { data, error } = await supabase
    .from("absent_info")
    .select("*")
    .eq("absent_info_id", id)
    .single();

  if (error) return c.json({ error: error.message }, 500);
  if (!data) return c.json({ error: "data not found" }, 404);

  return c.json(data);
});

absentRouter.post("/submit",async (c) => {
  const { userId,uname,date,type,reason } = await c.req.json();
  if (!userId || !uname || !date || !type) {
    return c.json({ success: false, message: '必須入力です' }, 400);
  }
  let res;
  let other_notes;
  if(reason === "sick" || reason === "wounded" || reason===null){
    res = reason;
    other_notes = null;
  }else if(type==="leaving-early"){
    res = "other";
    other_notes = reason;
  }else{
    res = null;
    other_notes = reason;
  }

  const day = new Date(date);


  console.log('Received data:', { userId,uname,date,type,reason});
  console.log(parseInt(userId,10),uname,day.toISOString(),type,res,other_notes);
  const supabase = createSupabaseClient(c);
  const { data, error } = await supabase
      .from("absent_info")
      .insert({student_user_id:parseInt(userId,10),user_name:uname,day_off:day.toISOString(),select_type:type,reason:res,other_notes:other_notes})
      .select();

    if (error) return c.json({ success:false, error: error.message,message:error.message }, 500);
    return c.json({success: true ,data, message: "success"},201); 
});

absentRouter.post(
  "/",
  zValidator("json", createAbsentSchema),
  async (c) => {
    const  AbsentData = c.req.valid("json");
    const supabase = createSupabaseClient(c);
    const { data, error } = await supabase
      .from("absent_info")
      .insert(AbsentData)
      .select();

    if (error) return c.json({ error: error.message }, 500);
    return c.json(data,201); 
  }
);

absentRouter.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const supabase = createSupabaseClient(c);

  const { error } = await supabase
    .from("absent_info")
    .delete()
    .eq("absent_info_id", id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ message: "Absent Info deleted successfully" });
});

export default  absentRouter;
