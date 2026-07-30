import { Plus, Sparkles } from "lucide-react";

export function TopHeader() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-5">
      <h1 className="text-[15px] font-semibold text-neutral-900">
        Sanofi Nexus AI
      </h1>

      <div className="flex items-center gap-5">
        <button className="flex items-center gap-1.5 rounded-full border border-neutral-200 px-3.5 py-1.5 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50">
          <Plus className="h-3.5 w-3.5" />
          New chat
        </button>

        <a
          href="#"
          className="text-[13px] font-medium text-neutral-500 hover:text-neutral-800"
        >
          Decom &rarr;
        </a>
        <a
          href="#"
          className="text-[13px] font-medium text-neutral-500 hover:text-neutral-800"
        >
          AG-UI lab &rarr;
        </a>

        <button
          aria-label="Toggle theme"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
        >
          <Sparkles className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
