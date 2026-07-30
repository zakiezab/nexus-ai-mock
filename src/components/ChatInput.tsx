"use client";

import { ArrowUp, Plus } from "lucide-react";
import { useRef, useState } from "react";

const MAX_HEIGHT_PX = 160;

export function ChatInput({ onSend }: { onSend?: (value: string) => void }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const resize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend?.(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className="mx-auto w-full max-w-[850px] px-6 pb-4">
      <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
        <button
          aria-label="Add attachment"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100"
        >
          <Plus className="h-4 w-4" />
        </button>
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            resize(e.target);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Type a message..."
          className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-[14px] leading-relaxed text-neutral-800 outline-none placeholder:text-neutral-400"
        />
        <button
          aria-label="Send message"
          onClick={submit}
          disabled={!value.trim()}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-white hover:bg-neutral-700 disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-2 text-center text-[12px] text-neutral-400">
        AI can make mistakes. Please verify important information.
      </p>
    </div>
  );
}
