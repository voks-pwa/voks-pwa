import { supabase } from "@/lib/supabase";
import type { ActionEvent, ActionEventName, ActionEventPayloads } from "./types";

type Consumer = (event: ActionEvent) => void;

const consumers = new Set<Consumer>();

const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60_000;

// Idempotency: prevent duplicate action processing (defense in depth vs. RPC row-locking)
const idempotencyMap = new Map<string, number>();
const IDEMPOTENCY_TTL = 10_000;

function deriveIdempotencyKey(
  name: ActionEventName,
  userId: string,
  idempotencyKey?: string,
): string | null {
  if (idempotencyKey) {
    return `${userId}:${name}:${idempotencyKey}`;
  }

  // Auto-derive once-per-account keys for claim-critical events
  switch (name) {
    case "PROFILE_COMPLETED":
      return `${userId}:PROFILE_COMPLETED`;
    case "CHECKIN":
      return `${userId}:CHECKIN`;
    case "REFERRAL_SUCCESS":
      return `${userId}:REFERRAL_SUCCESS`;
    default:
      return null;
  }
}

function isDuplicate(key: string | null): boolean {
  if (!key) return false;

  const now = Date.now();
  const last = idempotencyMap.get(key);

  if (last && now - last < IDEMPOTENCY_TTL) {
    console.warn(`Action Engine duplicate dropped: ${key}`);
    return true;
  }

  idempotencyMap.set(key, now);
  return false;
}

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now - entry.windowStart >= RATE_LIMIT_WINDOW) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return false;
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX) {
    console.warn(`Action Engine rate limited: user ${userId} exceeded ${RATE_LIMIT_MAX} actions/min`);
    return true;
  }

  return false;
}

export function subscribeAction(consumer: Consumer): () => void {
  consumers.add(consumer);
  return () => {
    consumers.delete(consumer);
  };
}

function dispatchEvent(event: ActionEvent) {
  consumers.forEach((consumer) => {
    try {
      void consumer(event);
    } catch (err) {
      console.error("Action Engine consumer error:", err);
    }
  });
}

function recordEvent(event: ActionEvent) {
  void (async () => {
    try {
      const metadata = event.payload
        ? JSON.parse(JSON.stringify(event.payload))
        : {};

      const { error } = await supabase.from("activity_logs").insert({
        user_id: event.userId,
        activity_type: event.name.toLowerCase(),
        xp: 0,
        metadata,
      });

      if (error) {
        console.error("Action Engine record fail:", error.message, "event:", event.name, "userId:", event.userId);
      }
    } catch (err) {
      console.error("Action Engine record exception:", err);
    }
  })();
}

export function track<T extends ActionEventName>(
  name: T,
  userId: string,
  payload?: ActionEventPayloads[T],
  amount?: number,
  idempotencyKey?: string,
): void {
  if (!userId) return;

  const event: ActionEvent<T> = { name, userId, amount, payload };

  const key = deriveIdempotencyKey(name, userId, idempotencyKey);

  if (!isRateLimited(userId) && !isDuplicate(key)) {
    dispatchEvent(event);
  }

  recordEvent(event);
}
