import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import studentRouter from "./routes/students";
import studentNewsRouter from "./routes/studentNews";
import teacherAdminNewsRouter from "./routes/adminTeacherNews";
import coursesRouter from "./routes/courses";
import schoolEventsRouter from "./routes/schoolEvents";
import teacherRouter from "./routes/teachers";
import adminRouter from "./routes/admins";
import loginRouter from "./routes/login";

const app = new Hono();
app.use("*", cors());

// Root Route
app.get("/", (c) => c.text("Gaku-app Kai Api"));

// Mount Routes
app.route("/students", studentRouter);
app.route("/student-news", studentNewsRouter);
app.route("/teacher-admin-news", teacherAdminNewsRouter);
app.route("/courses", coursesRouter);
app.route("/school-events", schoolEventsRouter);
app.route("/teachers", teacherRouter);
app.route("/admins", adminRouter);
app.route("/login", loginRouter);

// Start the server
const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
