import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import studentRouter from "./routes/students";
import studentNewsRouter from "./routes/studentNews";
import teacherAdminNewsRouter from "./routes/adminTeacherNews";

import schoolEventsRouter from "./routes/schoolEvents";

const app = new Hono();
app.use("*", cors());

// Root Route
app.get("/", (c) => c.text("Gaku-app Kai Api"));

// Mount Student Routes
app.route("/students", studentRouter);
app.route("/student-news", studentNewsRouter);
app.route("/teacher-admin-news", teacherAdminNewsRouter);
app.route("/school-events",schoolEventsRouter)

// Start the server
const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
