import { prisma } from "@/lib/prisma/client";

const SWEEP_INTERVAL_MS = 60 * 60 * 1000;

let lastSweepAt = 0;

// Opportunistic retention: when FEEDBACK_RETENTION_DAYS is set, feedback
// older than the window is deleted at most once an hour, piggybacking on
// ingest traffic. No cron or external scheduler required. Fire-and-forget:
// never blocks or fails a request.
export function maybeSweepRetention(): void {
  const days = Number(process.env.FEEDBACK_RETENTION_DAYS);
  if (!Number.isFinite(days) || days <= 0) return;

  const now = Date.now();
  if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;
  lastSweepAt = now;

  const cutoff = new Date(now - days * 24 * 60 * 60 * 1000);
  void prisma.feedback
    .deleteMany({ where: { createdAt: { lt: cutoff } } })
    .then((result) => {
      if (result.count > 0) {
        console.log(`[retention] deleted ${result.count} feedback row(s) older than ${days} day(s)`);
      }
    })
    .catch((error) => {
      console.error("[retention] sweep failed:", error);
    });
}

// For tests.
export function resetRetentionTimer() {
  lastSweepAt = 0;
}
