import { Check, Loader2, X } from "lucide-react";
import clsx from "clsx";
import type { CallStatus, ToolCall } from "@/lib/agentRun";

const statusLabel: Record<CallStatus, string> = {
  pending: "pending",
  running: "running…",
  complete: "complete",
  error: "error",
};

const statusLabelColor: Record<CallStatus, string> = {
  pending: "text-neutral-400",
  running: "text-amber-600",
  complete: "text-neutral-400",
  error: "text-rose-500",
};

function StepIcon({ index, status }: { index: number; status: CallStatus }) {
  if (status === "complete") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <X className="h-3 w-3" />
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-[11px] font-semibold text-neutral-400">
      {index}
    </span>
  );
}

export function StepsList({ calls }: { calls: ToolCall[] }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2">
      <ol className="divide-y divide-neutral-100">
        {calls.map((call, i) => (
          <li key={call.id} className="flex items-center gap-3 px-3 py-2.5">
            <StepIcon index={i + 1} status={call.status} />
            <span
              className={clsx(
                "flex-1 text-[13px] font-medium",
                call.status === "pending" ? "text-neutral-400" : "text-neutral-800"
              )}
            >
              {call.label}
            </span>
            <span className={clsx("text-[12px]", statusLabelColor[call.status])}>
              {statusLabel[call.status]}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
