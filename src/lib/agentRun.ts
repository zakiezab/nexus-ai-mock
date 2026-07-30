"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CallStatus = "pending" | "running" | "complete" | "error";

export type ToolCall = {
  id: string;
  group: string;
  label: string;
  status: CallStatus;
  durationMs: number;
};

export type ActivityRun = {
  id: string;
  prompt: string;
  summary: string;
  response: string[];
  calls: ToolCall[];
  showTraceDetails: boolean;
  showResponse: boolean;
};

export const groupNames = [
  "Skill",
  "ToolSearch",
  "servicenow_incident",
  "classify_incidents",
];

type CallSeed = Omit<ToolCall, "status" | "durationMs">;

type RunTemplate = {
  summary: string;
  responses: (prompt: string, previousPrompt?: string) => string[];
  calls: CallSeed[];
};

const runTemplates: RunTemplate[] = [
  {
    summary: "Incident retrieval and classification run",
    responses: () => [
      "The runtime stayed in ServiceNow reader mode, so I queried the incident source directly rather than dispatching a sub-agent.",
      "The first pass returned a stats-oriented summary, so I retried with a full record fetch to sort the latest P1 incidents by opened time.",
      "I then classified the resulting incident set to extract the IRIS categories needed for the final report."
    ],
    calls: [
      { id: "skill", group: "Skill", label: "Load incident investigation skill" },
      { id: "toolsearch", group: "ToolSearch", label: "Inspect ServiceNow tool capability" },
      { id: "servicenow-1", group: "servicenow_incident", label: "Fetch latest P1 incident stats" },
      { id: "servicenow-2", group: "servicenow_incident", label: "Refetch full incident records" },
      { id: "classify", group: "classify_incidents", label: "Classify incidents by IRIS code" },
    ],
  },
  {
    summary: "Follow-up triage and ownership analysis",
    responses: (prompt, previousPrompt) => [
      `Building on the previous incident pull${previousPrompt ? ` for "${previousPrompt}"` : ""}, I used this follow-up request to focus the next pass on ownership and triage patterns.`,
      `For "${prompt}", the agent narrows the incident slice, enriches the matching records with assignment details, then groups them by queue so the answer stays connected to the earlier thread.`,
      "That gives the next response a more continuous narrative instead of restarting from scratch."
    ],
    calls: [
      { id: "skill", group: "Skill", label: "Load follow-up triage skill" },
      { id: "servicenow-1", group: "servicenow_incident", label: "Query incidents from prior result set" },
      { id: "classify", group: "classify_incidents", label: "Summarize queue-level patterns" },
    ],
  },
  {
    summary: "Recommendation and next-step synthesis",
    responses: (prompt, previousPrompt) => [
      `After the earlier investigation${previousPrompt ? ` on "${previousPrompt}"` : ""}, this pass turns the raw incident details into a recommendation set for "${prompt}".`,
      "The agent compares the most recent matching incidents, identifies repeated failure modes, and prepares action-oriented guidance rather than another raw listing.",
      "This mock result is intentionally chained to the earlier context so the conversation feels continuous across sends."
    ],
    calls: [
      { id: "skill", group: "Skill", label: "Load recommendation synthesis skill" },
      { id: "toolsearch", group: "ToolSearch", label: "Resolve recommendation helpers" },
      { id: "servicenow-1", group: "servicenow_incident", label: "Pull supporting incident evidence" },
      { id: "servicenow-2", group: "servicenow_incident", label: "Retrieve repeated failure examples" },
      { id: "classify", group: "classify_incidents", label: "Generate recommended next steps" },
    ],
  },
];

export function aggregateStatus(calls: ToolCall[]): CallStatus {
  if (calls.length === 0) return "pending";
  if (calls.some((c) => c.status === "error")) return "error";
  if (calls.every((c) => c.status === "complete")) return "complete";
  const started = calls.some((c) => c.status !== "pending");
  return started ? "running" : "pending";
}

function shuffled<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const ERROR_CHANCE = 0.12;
const TRACE_DETAILS_DELAY_MS = 900;
const RESPONSE_DELAY_MS = 1350;

function createRun(prompt: string, index: number, previousPrompt?: string): ActivityRun {
  const template = runTemplates[index % runTemplates.length];

  return {
    id: `run-${index + 1}`,
    prompt,
    summary: template.summary,
    response: template.responses(prompt, previousPrompt),
    calls: template.calls.map((call, callIndex) => ({
      ...call,
      id: `${call.id}-${index + 1}-${callIndex + 1}`,
      status: "pending",
      durationMs: 0,
    })),
    showTraceDetails: false,
    showResponse: false,
  };
}

export function useAgentRun() {
  const [runs, setRuns] = useState<ActivityRun[]>(() => [
    createRun("What are the most recent P1 incidents?", 0),
  ]);
  const [activeRunId, setActiveRunId] = useState("run-1");
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const runsRef = useRef<ActivityRun[]>(runs);

  useEffect(() => {
    runsRef.current = runs;
  }, [runs]);

  // Calls all start together, then finish in a random order/timing
  // to reflect concurrent tool execution with varied durations.
  const scheduleRun = useCallback((runId: string, callIds: string[]) => {
    const startAt = TRACE_DETAILS_DELAY_MS + 250;
    const ids = shuffled(callIds);
    const durations = shuffled([3000, 6000, 10000, 6000, 3000]);
    const durationById = Object.fromEntries(
      ids.map((id, index) => [id, durations[index]])
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setRuns((prev) =>
          prev.map((run) =>
            run.id === runId ? { ...run, showTraceDetails: true } : run
          )
        );
      }, TRACE_DETAILS_DELAY_MS)
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setRuns((prev) =>
          prev.map((run) =>
            run.id === runId ? { ...run, showResponse: true } : run
          )
        );
      }, RESPONSE_DELAY_MS)
    );

    timeoutsRef.current.push(
      setTimeout(() => {
        setRuns((prev) =>
          prev.map((run) =>
            run.id !== runId
              ? run
              : {
                  ...run,
                  calls: run.calls.map((c) => ({
                    ...c,
                    status: "running",
                    durationMs: durationById[c.id] ?? 0,
                  })),
                }
          )
        );
      }, startAt)
    );

    for (const [index, id] of ids.entries()) {
      const endAt = startAt + durations[index];

      timeoutsRef.current.push(
        setTimeout(() => {
          const failed = Math.random() < ERROR_CHANCE;
          setRuns((prev) =>
            prev.map((run) =>
              run.id !== runId
                ? run
                : {
                    ...run,
                    calls: run.calls.map((c) =>
                      c.id === id ? { ...c, status: failed ? "error" : "complete" } : c
                    ),
                  }
            )
          );
        }, endAt)
      );
    }
  }, []);

  const sendMessage = useCallback(
    (prompt: string) => {
      const previousPrompt = runsRef.current.at(-1)?.prompt;
      const nextIndex = runsRef.current.length;
      const nextRun = createRun(prompt, nextIndex, previousPrompt);

      setRuns((prev) => [...prev, nextRun]);
      setActiveRunId(nextRun.id);
      scheduleRun(nextRun.id, nextRun.calls.map((c) => c.id));
    },
    [scheduleRun]
  );

  useEffect(() => {
    scheduleRun("run-1", runsRef.current[0].calls.map((c) => c.id));
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, [scheduleRun]);

  return { runs, activeRunId, setActiveRunId, sendMessage };
}
