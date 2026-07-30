"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useMemo } from "react";
import { graphEdges, graphNodeMeta } from "@/lib/data";
import { GraphNode, type GraphNodeType } from "@/components/nodes/GraphNodes";
import { aggregateStatus, type ToolCall } from "@/lib/agentRun";

const nodeTypes = { graphNode: GraphNode };

const edgeColor = {
  pending: "#d1d5db",
  running: "#fbbf24",
  complete: "#d1d5db",
  error: "#fda4af",
};

export function InvestigationFlow({
  calls,
  height = 420,
}: {
  calls: ToolCall[];
  height?: number;
}) {
  const nodes: Node[] = useMemo(
    () =>
      graphNodeMeta.map((n) => {
        const groupCalls = n.group ? calls.filter((c) => c.group === n.group) : [];
        const status = n.group ? aggregateStatus(groupCalls) : "complete";
        const sublabel =
          n.kind === "root"
            ? n.sublabel ?? ""
            : `${groupCalls.length} call${groupCalls.length === 1 ? "" : "s"}`;

        return {
          id: n.id,
          type: "graphNode",
          position: { x: n.x, y: n.y },
          data: { label: n.label, sublabel, kind: n.kind, status } satisfies GraphNodeType,
          draggable: false,
        };
      }),
    [calls]
  );

  const edges: Edge[] = useMemo(
    () =>
      graphEdges.map((e) => {
        const targetStatus =
          (nodes.find((n) => n.id === e.target)?.data as GraphNodeType | undefined)
            ?.status ?? "pending";

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: "smoothstep",
          animated: targetStatus === "running",
          style: { stroke: edgeColor[targetStatus], strokeWidth: 1.5 },
        };
      }),
    [nodes]
  );

  return (
    <div
      className="w-full overflow-hidden rounded-xl border border-neutral-200 bg-white"
      style={{ height }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
        <Controls
          showInteractive={false}
          className="!bottom-3 !left-3 !shadow-none [&>button]:!border-neutral-200 [&>button]:!bg-white"
        />
      </ReactFlow>
    </div>
  );
}
