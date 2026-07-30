import { Handle, Position, type NodeProps } from "@xyflow/react";
import clsx from "clsx";
import { StatusDot } from "@/components/StatusDot";
import type { CallStatus } from "@/lib/agentRun";

export type GraphNodeType = {
  label: string;
  sublabel: string;
  kind: "root" | "leaf";
  status: CallStatus;
};

const borderByStatus: Record<CallStatus, string> = {
  pending: "border-neutral-200",
  running: "border-amber-200",
  complete: "border-neutral-200",
  error: "border-rose-200",
};

export function GraphNode({ data }: NodeProps & { data: GraphNodeType }) {
  const isRoot = data.kind === "root";

  return (
    <div
      className={clsx(
        "w-[190px] rounded-xl border bg-white px-4 py-2.5 shadow-sm transition-colors",
        isRoot
          ? "border-brand/40 border-l-[3px] border-l-brand"
          : borderByStatus[data.status]
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!h-2 !w-2 !border-neutral-300 !bg-white"
      />
      <div className="flex items-center gap-1.5">
        {isRoot ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
        ) : (
          <StatusDot status={data.status} />
        )}
        <span className="truncate text-[13px] font-semibold text-neutral-900">
          {data.label}
        </span>
      </div>
      <p className="mt-0.5 pl-3 text-[12px] text-neutral-500">{data.sublabel}</p>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-2 !w-2 !border-neutral-300 !bg-white"
      />
    </div>
  );
}
