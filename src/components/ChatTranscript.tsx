"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Activity, ChevronDown, SquareAsterisk } from "lucide-react";
import clsx from "clsx";
import type { ActivityRun, CallStatus, ToolCall } from "@/lib/agentRun";

const fillClass: Partial<Record<CallStatus, string>> = {
  complete: "bg-brand",
  error: "bg-rose-500",
};

function TraceSegment({
  status,
  durationMs,
}: {
  status: CallStatus;
  durationMs: number;
}) {
  return (
    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-neutral-200">
      {status === "running" && (
        <span
          className="animate-trace-running absolute inset-y-0 left-0 rounded-full bg-brand-light"
          style={{ animationDuration: `${durationMs}ms` }}
        />
      )}
      {(status === "complete" || status === "error") && (
        <span
          key={status}
          className={clsx(
            "animate-trace-fill absolute inset-y-0 left-0 rounded-full",
            fillClass[status]
          )}
        />
      )}
    </div>
  );
}

function TypewriterResponse({
  paragraphs,
  start,
}: {
  paragraphs: string[];
  start: boolean;
}) {
  const fullText = useMemo(() => paragraphs.join("\n\n"), [paragraphs]);
  const [visibleChars, setVisibleChars] = useState(start ? 0 : 0);

  useEffect(() => {
    if (!start) {
      setVisibleChars(0);
      return;
    }

    let index = 0;
    const timer = window.setInterval(() => {
      index += 3;
      setVisibleChars(Math.min(index, fullText.length));
      if (index >= fullText.length) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [fullText, start]);

  const visibleText = fullText.slice(0, visibleChars);
  const visibleParagraphs = visibleText.split("\n\n");

  return (
    <div className="space-y-4 text-[14px] leading-relaxed text-neutral-800">
      {visibleParagraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph}`}>{paragraph}</p>
      ))}
    </div>
  );
}

export function ChatTranscript({
  runs,
  activeRunId,
  scrollContainerRef,
  onOpenActivity,
}: {
  runs: ActivityRun[];
  activeRunId: string;
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onOpenActivity: (runId: string) => void;
}) {
  const [traceOpen, setTraceOpen] = useState<Record<string, boolean>>({});
  const [responseOpen, setResponseOpen] = useState<Record<string, boolean>>({});
  const [hideCompletedTrace, setHideCompletedTrace] = useState<Record<string, boolean>>({});
  const traceHideTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    for (const run of runs) {
      const isComplete = run.calls.every(
        (call) => call.status === "complete" || call.status === "error"
      );

      if (isComplete && !hideCompletedTrace[run.id] && !traceHideTimersRef.current[run.id]) {
        traceHideTimersRef.current[run.id] = window.setTimeout(() => {
          setHideCompletedTrace((prev) => ({ ...prev, [run.id]: true }));
          delete traceHideTimersRef.current[run.id];
        }, 2000);
      }

      if (!isComplete && hideCompletedTrace[run.id]) {
        setHideCompletedTrace((prev) => ({ ...prev, [run.id]: false }));
      }
    }
  }, [hideCompletedTrace, runs]);

  useEffect(() => {
    return () => {
      for (const timer of Object.values(traceHideTimersRef.current)) {
        window.clearTimeout(timer);
      }
      traceHideTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const latestRun = runs.at(-1);
    if (!latestRun) return;

    const isGenerating =
      !latestRun.showResponse ||
      latestRun.calls.some(
        (call) => call.status === "pending" || call.status === "running"
      );

    if (!isGenerating) return;

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }, [runs, scrollContainerRef]);

  return (
    <div className="mx-auto w-full max-w-[850px] px-6 py-8">
      <div className="space-y-10">
        {runs.map((run) => {
          const total = run.calls.length;
          const settled = run.calls.filter(
            (c) => c.status === "complete" || c.status === "error"
          ).length;
          const errorCount = run.calls.filter((c) => c.status === "error").length;
          const isComplete = settled === total;
          const shouldShowTrace = !hideCompletedTrace[run.id];
          const isTraceOpen = traceOpen[run.id] ?? true;
          const isResponseOpen = responseOpen[run.id] ?? true;

          return (
            <div key={run.id}>
              <div className="flex justify-end">
                <div className="max-w-[70%] rounded-2xl rounded-tr-md bg-secondary-soft px-4 py-2.5 text-[14px]">
                  {run.prompt}
                </div>
              </div>

              <div className="mt-6">
                {shouldShowTrace && (
                  <>
                    <button
                      onClick={() =>
                        setTraceOpen((prev) => ({ ...prev, [run.id]: !(prev[run.id] ?? true) }))
                      }
                      className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-neutral-400"
                    >
                      <ChevronDown
                        className={clsx(
                          "h-3.5 w-3.5 transition-transform",
                          !isTraceOpen && "-rotate-90"
                        )}
                      />
                      {run.showTraceDetails ? "TRACE" : "ANALYZING"}
                    </button>

                    {isTraceOpen && (
                      <>
                        {run.showTraceDetails ? (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-2 flex-1 gap-1">
                              {run.calls.map((call) => (
                                <TraceSegment
                                  key={call.id}
                                  status={call.status}
                                  durationMs={call.durationMs}
                                />
                              ))}
                            </div>
                            <span className="shrink-0 text-[12px] text-neutral-400">
                              {`${settled}/${total} steps`}
                            </span>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="flex h-2 flex-1 gap-1">
                              {Array.from({ length: Math.max(total, 3) }).map((_, index) => (
                                <span
                                  key={index}
                                  className="h-2 flex-1 animate-pulse rounded-full bg-neutral-200"
                                />
                              ))}
                            </div>
                            <span className="shrink-0 text-[12px] text-neutral-300">
                              analyzing...
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}

                {run.showTraceDetails ? (
                  <button
                    onClick={() => onOpenActivity(run.id)}
                    className={clsx(
                      "mt-3 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition",
                      activeRunId === run.id
                        ? "border-brand/30 bg-brand-soft"
                        : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-brand shadow-sm">
                      <SquareAsterisk className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13px] font-semibold text-neutral-900">
                        Agent activity card
                      </div>
                      <div className="mt-0.5 truncate text-[12px] text-neutral-500">
                        {run.summary}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                          {isComplete
                            ? `${total} step${total === 1 ? "" : "s"}`
                            : `${settled}/${total} step${total === 1 ? "" : "s"}`}
                        </span>
                        {errorCount > 0 && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                            {errorCount} error{errorCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-neutral-400">
                      Open
                    </span>
                  </button>
                ) : (
                  <div className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
                    <span className="h-9 w-9 animate-pulse rounded-full bg-neutral-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-32 animate-pulse rounded-full bg-neutral-200" />
                      <div className="h-3 w-56 animate-pulse rounded-full bg-neutral-100" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6">
                {isResponseOpen && (
                  <TypewriterResponse
                    paragraphs={run.response}
                    start={run.showResponse}
                  />
                )}
              </div>

              <div className="mt-4 flex justify-center">
                <button
                  onClick={() =>
                    setResponseOpen((prev) => ({
                      ...prev,
                      [run.id]: !(prev[run.id] ?? true),
                    }))
                  }
                  aria-label="Toggle response detail"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 text-neutral-400 hover:bg-neutral-50"
                >
                  <ChevronDown
                    className={clsx(
                      "h-4 w-4 transition-transform",
                      !isResponseOpen && "rotate-180"
                    )}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
