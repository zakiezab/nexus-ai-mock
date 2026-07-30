import clsx from "clsx";
import type { CallStatus } from "@/lib/agentRun";

const dotColor: Record<CallStatus, string> = {
  pending: "bg-neutral-300",
  running: "bg-amber-500",
  complete: "bg-emerald-500",
  error: "bg-rose-500",
};

export function StatusDot({
  status,
  className,
}: {
  status: CallStatus;
  className?: string;
}) {
  if (status === "running") {
    return (
      <span className={clsx("relative inline-flex h-1.5 w-1.5 shrink-0", className)}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
      </span>
    );
  }

  return (
    <span
      className={clsx(
        "h-1.5 w-1.5 shrink-0 rounded-full",
        dotColor[status],
        className
      )}
    />
  );
}
