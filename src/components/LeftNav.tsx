"use client";

import {
  FileText,
  Sparkles,
  ListChecks,
  LineChart,
  PanelLeftClose,
  PanelLeftOpen,
  Radio,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

type NavKey = "evidence" | "activity" | "plan" | "report";

const navItems: {
  key: NavKey;
  label: string;
  icon: typeof FileText;
  badge?: string;
}[] = [
  { key: "evidence", label: "Incident evidence", icon: FileText },
  { key: "activity", label: "Agent activity", icon: Sparkles, badge: "5" },
  { key: "plan", label: "Investigation plan", icon: ListChecks },
  { key: "report", label: "Investigation report", icon: LineChart },
];

export function LeftNav({
  active,
  onSelect,
}: {
  active: NavKey;
  onSelect: (key: NavKey) => void;
}) {
  const [mcpOnline] = useState(12);
  const [mcpTotal] = useState(13);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={clsx(
        "flex h-full shrink-0 flex-col rounded-2xl border border-neutral-200 bg-white shadow-lg transition-[width] duration-200 ease-out",
        collapsed ? "w-[72px]" : "w-[270px]"
      )}
    >
      <div
        className={clsx(
          "flex items-center border-b border-neutral-100 py-4",
          collapsed ? "flex-col gap-3 px-2" : "gap-2.5 px-4"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white">
          N
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold text-neutral-900">
              Sanofi Nexus
            </p>
            <p className="truncate text-[12px] text-neutral-500">
              NOC investigation
            </p>
          </div>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className={clsx("mt-3 flex-1", collapsed ? "px-2" : "px-3")}>
        {!collapsed && (
          <p className="px-2 pb-2 text-[11px] font-semibold tracking-wide text-neutral-400">
            INVESTIGATION
          </p>
        )}
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === active;
            return (
              <li key={item.key} className="relative">
                {isActive && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-1 -translate-x-3 -translate-y-1/2 rounded-full bg-brand" />
                )}
                <button
                  onClick={() => onSelect(item.key)}
                  title={
                    collapsed
                      ? item.badge
                        ? `${item.label} (${item.badge})`
                        : item.label
                      : undefined
                  }
                  className={clsx(
                    "flex w-full items-center rounded-lg text-left text-[13px] font-medium transition-colors",
                    collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2",
                    isActive
                      ? "bg-brand-soft text-brand"
                      : "text-neutral-600 hover:bg-neutral-50"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                  {!collapsed && item.badge && (
                    <span
                      className={clsx(
                        "rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                        isActive
                          ? "bg-white text-brand"
                          : "bg-neutral-100 text-neutral-500"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={clsx(
          "border-t border-neutral-100 py-3",
          collapsed ? "px-2" : "px-4"
        )}
      >
        <button
          title={collapsed ? `MCP health ${mcpOnline}/${mcpTotal}` : undefined}
          className={clsx(
            "flex w-full items-center text-[13px] font-medium text-neutral-600 hover:text-neutral-900",
            collapsed ? "justify-center" : "gap-2.5"
          )}
        >
          <Radio className="h-4 w-4 shrink-0 text-neutral-400" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">MCP health</span>
              <span className="flex items-center gap-1.5 rounded-full bg-red-50 px-2 py-1 text-[12px] font-medium text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                {mcpOnline}/{mcpTotal}
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
