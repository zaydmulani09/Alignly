type EventName = 
  | "resume_uploaded"
  | "analysis_started"
  | "analysis_completed"
  | "chat_message_sent"
  | "draft_exported"
  | "bullet_rewrite_accepted";

interface AnalyticsEvent {
  name: EventName;
  data?: Record<string, any>;
}

export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    const events = JSON.parse(sessionStorage.getItem("analytics-events") || "[]");
    events.push({ ...event, timestamp: Date.now() });
    if (events.length > 100) events.shift();
    sessionStorage.setItem("analytics-events", JSON.stringify(events));
  } catch (e) {
    console.error("Analytics tracking failed", e);
  }
}
