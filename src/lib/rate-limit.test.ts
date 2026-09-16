import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, rateLimit, resetRateLimits } from "./rate-limit";

beforeEach(() => resetRateLimits());

describe("rateLimit", () => {
  it("allows up to the limit and then refuses", () => {
    const now = 1_000_000;
    expect(rateLimit("a", 3, now).allowed).toBe(true);
    expect(rateLimit("a", 3, now).allowed).toBe(true);
    expect(rateLimit("a", 3, now).allowed).toBe(true);
    expect(rateLimit("a", 3, now).allowed).toBe(false);
  });

  it("counts down the remaining allowance", () => {
    const now = 1_000_000;
    expect(rateLimit("a", 3, now).remaining).toBe(2);
    expect(rateLimit("a", 3, now).remaining).toBe(1);
    expect(rateLimit("a", 3, now).remaining).toBe(0);
  });

  it("keys are independent", () => {
    const now = 1_000_000;
    rateLimit("a", 1, now);
    expect(rateLimit("a", 1, now).allowed).toBe(false);
    expect(rateLimit("b", 1, now).allowed).toBe(true);
  });

  it("opens a fresh window once the old one expires", () => {
    const now = 1_000_000;
    rateLimit("a", 1, now);
    expect(rateLimit("a", 1, now + 59_000).allowed).toBe(false);
    expect(rateLimit("a", 1, now + 60_001).allowed).toBe(true);
  });

  it("reports seconds until reset when refusing", () => {
    const now = 1_000_000;
    rateLimit("a", 1, now);
    expect(rateLimit("a", 1, now + 30_000).retryAfter).toBe(30);
  });

  it("never reports a retryAfter of zero while blocked", () => {
    const now = 1_000_000;
    rateLimit("a", 1, now);
    expect(rateLimit("a", 1, now + 59_999).retryAfter).toBe(1);
  });
});

describe("clientKey", () => {
  const withHeaders = (headers: Record<string, string>) =>
    new Request("https://example.test/api/analyze", { headers });

  it("uses the left-most forwarded address", () => {
    const key = clientKey(
      withHeaders({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" }),
      "analyze",
    );
    expect(key).toBe("analyze:203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(withHeaders({ "x-real-ip": "198.51.100.7" }), "chat")).toBe(
      "chat:198.51.100.7",
    );
  });

  it("scopes routes separately", () => {
    const headers = { "x-forwarded-for": "203.0.113.5" };
    expect(clientKey(withHeaders(headers), "analyze")).not.toBe(
      clientKey(withHeaders(headers), "chat"),
    );
  });

  it("groups callers with no address information", () => {
    expect(clientKey(withHeaders({}), "analyze")).toBe("analyze:unknown");
  });
});
