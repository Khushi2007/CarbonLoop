import type { ShipmentStatus, WasteLotStatus } from "@prisma/client";

type Status = WasteLotStatus | ShipmentStatus;
type Tone = "neutral" | "success" | "warning" | "error";

const STATUS_TONE: Record<Status, Tone> = {
  AVAILABLE: "success",
  MATCHED: "neutral",
  IN_TRANSIT: "warning",
  PROCESSED: "success",
  CANCELLED: "error",
  SCHEDULED: "neutral",
  DELIVERED: "warning",
};

const TONE_CLASS: Record<Tone, string> = {
  neutral: "text-foreground-secondary",
  success: "text-success",
  warning: "text-warning",
  error: "text-error",
};

/** Plain colored text for status — deliberately not a pill/badge. */
export function StatusLabel({ status, className = "" }: { status: Status; className?: string }) {
  return <span className={`font-mono text-[0.85em] ${TONE_CLASS[STATUS_TONE[status]]} ${className}`}>{status}</span>;
}
