export type GraphNodeMeta = {
  id: string;
  label: string;
  kind: "root" | "leaf";
  x: number;
  y: number;
  sublabel?: string;
  group?: string;
};

export const graphNodeMeta: GraphNodeMeta[] = [
  { id: "incident", label: "Incident", sublabel: "Investigation", kind: "root", x: 0, y: 180 },
  { id: "skill", label: "Skill", kind: "leaf", x: 340, y: 0, group: "Skill" },
  { id: "toolsearch", label: "ToolSearch", kind: "leaf", x: 340, y: 120, group: "ToolSearch" },
  { id: "servicenow", label: "servicenow_incident", kind: "leaf", x: 340, y: 240, group: "servicenow_incident" },
  { id: "classify", label: "classify_incidents", kind: "leaf", x: 340, y: 360, group: "classify_incidents" },
];

export const graphEdges: { id: string; source: string; target: string }[] = [
  { id: "e-incident-skill", source: "incident", target: "skill" },
  { id: "e-incident-toolsearch", source: "incident", target: "toolsearch" },
  { id: "e-incident-servicenow", source: "incident", target: "servicenow" },
  { id: "e-incident-classify", source: "incident", target: "classify" },
];
