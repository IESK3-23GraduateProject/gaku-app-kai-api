import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSupabaseClient } from "../supabaseClient";

const loginRouter = new Hono();

// CORS ミドルウェアを設定
loginRouter.use(cors());

loginRouter.post('/submit', async (ctx) => {
  const { userId, pass } = await ctx.req.json();
  if (!userId || !pass) {
    return ctx.json({ success: false, message: 'ユーザーIDとメールアドレスは必須です' }, 400);
  }

  console.log('Received data:', { userId, pass });
  const supabase = createSupabaseClient(ctx);
  const { data, error } = await supabase.rpc("use_login_student", {
    student_id: parseInt(userId, 10),pass:pass
  });

  if (error) {
    return ctx.json({ error: error.message }, 500);
  }
  if(data.length === 0){
    return ctx.json({ success: false, message: 'ユーザーIDかパスワードが違います' });
  }

  console.log(data);

  return ctx.json({ success: true ,data, message: "success"});
});



// Get Single Student
loginRouter.get("/:id", async (c) => {
  const supabase = createSupabaseClient(c);
  const studentId = c.req.param("id");
  const pass = "student123";
  const { data, error } = await supabase.rpc("use_login_student", {
    student_id: parseInt(studentId, 10),
    pass: pass,
  });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ data });
});

export default loginRouter;
