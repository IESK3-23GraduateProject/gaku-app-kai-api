import { Hono } from "hono";
import webpush from "web-push";
import { createSupabaseClient } from "../supabaseClient";
import { HTTPException } from "hono/http-exception";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
  throw new Error("VAPID keys must be set");
}

webpush.setVapidDetails(
  "mailto:your-email@example.com",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

const push = new Hono();

// Type for push subscription payload
interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  student_user_id: number;
}

// Type for notification payload
interface NotificationPayload {
  title: string;
  body: string;
  student_user_id: number;
}

// Endpoint to save push subscription
push.post("/subscribe", async (c) => {
  try {
    const supabase = createSupabaseClient(c);
    const subscription = await c.req.json<PushSubscriptionPayload>();

    if (
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.student_user_id
    ) {
      throw new HTTPException(400, { message: "Invalid subscription data" });
    }

    // Check if student exists and is active
    const { data: student, error: studentError } = await supabase
      .from("student_users")
      .select("is_active")
      .eq("student_user_id", subscription.student_user_id)
      .single();

    if (studentError || !student) {
      throw new HTTPException(404, { message: "Student not found" });
    }

    if (!student.is_active) {
      throw new HTTPException(403, {
        message: "Student account is not active",
      });
    }

    // Store in Supabase
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        student_user_id: subscription.student_user_id,
        is_active: true,
      },
      {
        onConflict: "student_user_id,endpoint",
        ignoreDuplicates: false,
      }
    );

    if (error) {
      console.error("Supabase error:", error);
      throw new HTTPException(500, { message: "Failed to save subscription" });
    }

    return c.json({ message: "Subscription saved successfully" });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// Endpoint to send push notification
push.post("/send-notification", async (c) => {
  try {
    const supabase = createSupabaseClient(c);
    const payload = await c.req.json<NotificationPayload>();

    if (!payload.title || !payload.body || !payload.student_user_id) {
      throw new HTTPException(400, { message: "Invalid notification data" });
    }

    // Get active subscriptions from Supabase
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("student_user_id", payload.student_user_id)
      .eq("is_active", true);

    if (error) {
      console.error("Supabase error:", error);
      throw new HTTPException(500, { message: "Failed to get subscriptions" });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return c.json({ message: "No active subscriptions found" });
    }

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys,
            },
            JSON.stringify({
              title: payload.title,
              body: payload.body,
            })
          );
          return sub.endpoint;
        } catch (err) {
          // If subscription is invalid, mark it as inactive
          if (
            err instanceof Error &&
            "statusCode" in err &&
            (err as any).statusCode === 410
          ) {
            await supabase
              .from("push_subscriptions")
              .update({ is_active: false })
              .eq("endpoint", sub.endpoint);
          }
          throw err;
        }
      })
    );

    // Count successful and failed notifications
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return c.json({
      message: "Notifications processed",
      stats: {
        successful,
        failed,
        total: subscriptions.length,
      },
    });
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error;
    }
    throw new HTTPException(500, { message: "Internal server error" });
  }
});

// Endpoint to get VAPID public key
push.get("/vapid-public-key", (c) => {
  return c.json({ key: VAPID_PUBLIC_KEY });
});

export default push;
