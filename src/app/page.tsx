"use client";

import { useRef, useState } from "react";
import { TopHeader } from "@/components/TopHeader";
import { LeftNav } from "@/components/LeftNav";
import { ChatTranscript } from "@/components/ChatTranscript";
import { ChatInput } from "@/components/ChatInput";
import { AgentActivityPanel } from "@/components/AgentActivityPanel";
import { useAgentRun } from "@/lib/agentRun";

type NavKey = "evidence" | "activity" | "plan" | "report";

export default function Home() {
  const [active, setActive] = useState<NavKey>("activity");
  const [highlightedRunId, setHighlightedRunId] = useState<string | null>(null);
  const [highlightNonce, setHighlightNonce] = useState(0);
  const { runs, activeRunId, setActiveRunId, sendMessage } = useAgentRun();
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex h-full flex-col">
      <TopHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex shrink-0 py-3 pl-3">
          <LeftNav
            active={active}
            onSelect={(key) => setActive(key)}
          />
        </div>

        <main className="flex flex-1 flex-col overflow-hidden">
          <div ref={transcriptScrollRef} className="flex-1 overflow-y-auto">
            <ChatTranscript
              runs={runs}
              activeRunId={activeRunId}
              scrollContainerRef={transcriptScrollRef}
              onOpenActivity={(runId) => {
                setActiveRunId(runId);
                setHighlightedRunId(runId);
                setHighlightNonce((value) => value + 1);
              }}
            />
          </div>
          <ChatInput onSend={sendMessage} />
        </main>

        <div className="flex shrink-0 py-3 pr-3">
          <AgentActivityPanel
            runs={runs}
            activeRunId={activeRunId}
            onSelectRun={(runId) => setActiveRunId(runId)}
            highlightedRunId={highlightedRunId}
            highlightNonce={highlightNonce}
          />
        </div>
      </div>
    </div>
  );
}
