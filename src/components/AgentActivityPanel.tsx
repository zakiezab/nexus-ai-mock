"use client";

import {
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ChevronDown, ChevronRight, Expand, X } from "lucide-react";
import clsx from "clsx";
import { InvestigationFlow } from "@/components/InvestigationFlow";
import { StatusDot } from "@/components/StatusDot";
import {
  aggregateStatus,
  groupNames,
  type ActivityRun,
  type ToolCall,
} from "@/lib/agentRun";

type PanelTab = "steps" | "graph";

const statusLabel = {
  pending: "pending",
  running: "running…",
  complete: "complete",
  error: "error",
} as const;

const statusLabelColor = {
  pending: "text-neutral-400",
  running: "text-amber-600",
  complete: "text-neutral-400",
  error: "text-rose-500",
} as const;

export function AgentActivityPanel({
  runs,
  activeRunId,
  onSelectRun,
  highlightedRunId,
  highlightNonce,
}: {
  runs: ActivityRun[];
  activeRunId: string;
  onSelectRun: (runId: string) => void;
  highlightedRunId: string | null;
  highlightNonce: number;
}) {
  const [tab, setTab] = useState<PanelTab>("graph");
  const [minimized, setMinimized] = useState<Record<string, boolean>>({});
  const [maximizedRunId, setMaximizedRunId] = useState<string | null>(null);
  const [flashRunId, setFlashRunId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(groupNames.map((g) => [g, true]))
  );
  const isMaximized = maximizedRunId === activeRunId;

  useEffect(() => {
    if (!highlightedRunId) return;

    setMinimized((prev) => ({ ...prev, [highlightedRunId]: false }));
    setFlashRunId(highlightedRunId);

    const timer = window.setTimeout(() => setFlashRunId(null), 1200);
    return () => window.clearTimeout(timer);
  }, [highlightNonce, highlightedRunId]);

  return (
    <aside
      className="flex h-full shrink-0 flex-col transition-[width] duration-200"
      style={{ width: isMaximized ? "56rem" : "42rem" }}
    >
      <div className="space-y-3">
        {runs.map((run, index) => {
          const isActive = run.id === activeRunId;
          const isMinimized = minimized[run.id] ?? !isActive;
          const isExpandedCard = isActive && !isMinimized;
          const isFlashing = flashRunId === run.id;

          return (
            <section
              key={run.id}
              className={clsx(
                "overflow-hidden rounded-2xl border border-neutral-200 transition-all",
                isFlashing && "ring-2 ring-brand/40 ring-offset-2",
                isExpandedCard
                  ? "bg-neutral-50 shadow-lg"
                  : "bg-white shadow-sm hover:shadow-md"
              )}
            >
              {isExpandedCard ? (
                <>
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="min-w-0">
                      <h2 className="text-[15px] font-semibold text-neutral-900">
                        Agent activity
                      </h2>
                      <p className="mt-0.5 truncate text-[12px] text-neutral-400">
                        Run {index + 1}: {run.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setMaximizedRunId((prev) => (prev === run.id ? null : run.id))
                        }
                        aria-label="Expand activity panel"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900"
                      >
                        <Expand className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() =>
                          setMinimized((prev) => ({ ...prev, [run.id]: true }))
                        }
                        aria-label="Minimize agent activity"
                        className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 pb-5">
                    <div className="inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-0.5">
                      <button
                        onClick={() => setTab("steps")}
                        className={clsx(
                          "rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                          tab === "steps"
                            ? "bg-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        )}
                      >
                        Steps
                      </button>
                      <button
                        onClick={() => setTab("graph")}
                        className={clsx(
                          "rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors",
                          tab === "graph"
                            ? "bg-white shadow-sm"
                            : "text-neutral-600 hover:text-neutral-900"
                        )}
                      >
                        Graph
                      </button>
                    </div>

                    {tab === "steps" ? (
                      <div className="mt-4 space-y-3">
                        {groupNames
                          .filter((groupName) =>
                            run.calls.some((call) => call.group === groupName)
                          )
                          .map((groupName) => {
                          const groupCalls = run.calls.filter((c) => c.group === groupName);
                          return (
                            <GroupCard
                              key={`${run.id}-${groupName}`}
                              cardKey={`${run.id}-${groupName}`}
                              groupName={groupName}
                              calls={groupCalls}
                              expanded={expanded}
                              setExpanded={setExpanded}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <InvestigationFlow
                          calls={run.calls}
                          height={isMaximized ? 620 : 460}
                        />
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    onSelectRun(run.id);
                    setMinimized((prev) => ({ ...prev, [run.id]: false }));
                  }}
                  className="w-full px-4 py-3 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold text-neutral-900">
                        Agent activity
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-neutral-400">
                        Run {index + 1}: {run.summary}
                      </div>
                    </div>
                    <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                      {run.calls.length} calls
                    </span>
                  </div>
                </button>
              )}
            </section>
          );
        })}
      </div>
    </aside>
  );
}

function GroupCard({
  cardKey,
  groupName,
  calls,
  expanded,
  setExpanded,
}: {
  cardKey: string;
  groupName: string;
  calls: ToolCall[];
  expanded: Record<string, boolean>;
  setExpanded: Dispatch<SetStateAction<Record<string, boolean>>>;
}) {
  const status = aggregateStatus(calls);
  const isOpen = expanded[cardKey] ?? true;
  const runningCount = calls.filter((c) => c.status === "running").length;
  const completeCount = calls.filter((c) => c.status === "complete").length;
  const pendingCount = calls.filter((c) => c.status === "pending").length;
  const errorCount = calls.filter((c) => c.status === "error").length;

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() =>
          setExpanded((prev) => ({
            ...prev,
            [cardKey]: !isOpen,
          }))
        }
        className="flex w-full items-center gap-2 px-4 py-3.5 text-left"
      >
        <ChevronDown
          className={clsx(
            "h-4 w-4 shrink-0 text-neutral-500 transition-transform",
            !isOpen && "-rotate-90"
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[13px] font-medium text-neutral-900">
            {groupName}
          </div>
          <div className="mt-0.5 text-[12px] text-neutral-400">
            {calls.length} call{calls.length === 1 ? "" : "s"}
          </div>
        </div>
        <span className={clsx("text-[12.5px]", statusLabelColor[status])}>
          {statusLabel[status]}
        </span>
        <StatusDot status={status} />
      </button>

      <div className="border-t border-neutral-100 px-4 py-3">
        {isOpen ? (
          <div className="space-y-2">
            {calls.map((call) => (
              <div
                key={call.id}
                className="flex items-center gap-2.5 rounded-xl bg-neutral-50 px-3 py-2.5"
              >
                <StatusDot status={call.status} />
                <span className="flex-1 truncate font-mono text-[13px] text-neutral-800">
                  {call.label}
                </span>
                <span
                  className={clsx(
                    "text-[12.5px]",
                    statusLabelColor[call.status]
                  )}
                >
                  {statusLabel[call.status]}
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
              Minimized
            </span>
            {runningCount > 0 && (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                {runningCount} running
              </span>
            )}
            {completeCount > 0 && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                {completeCount} complete
              </span>
            )}
            {pendingCount > 0 && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500">
                {pendingCount} pending
              </span>
            )}
            {errorCount > 0 && (
              <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700">
                {errorCount} error
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
