import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  hint?: string;
  leading?: React.ReactNode;
}

/**
 * Theme-matching select to replace the default browser <select> (which can't be
 * styled to the app). Button trigger + a popover list; closes on click-away/Esc.
 */
export function Dropdown({
  value,
  onChange,
  options,
  placeholder = "Select…",
  className,
  size = "md",
  align = "start",
  variant = "default",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
  align?: "start" | "end";
  variant?: "default" | "ghost";
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md text-left text-ink outline-none transition-colors disabled:opacity-50",
          variant === "ghost"
            ? "-ml-2 border border-transparent hover:bg-[#3c315b]/5"
            : "border border-border bg-[#3c315b]/[0.02] hover:border-soft focus-visible:border-soft",
          size === "sm" ? "h-8 px-2.5 text-caption" : "h-10 px-3 text-label",
        )}
      >
        {selected?.leading}
        <span className={cn("flex-1 truncate", !selected && "text-faint")}>{selected?.label ?? placeholder}</span>
        <ChevronDown className={cn("shrink-0 text-faint transition-transform", size === "sm" ? "size-3" : "size-4", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute z-50 mt-1.5 max-h-64 min-w-full overflow-auto rounded-lg border border-border bg-surface p-1 shadow-2xl shadow-black/50",
            align === "end" ? "right-0" : "left-0",
          )}
        >
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-label transition-colors hover:bg-[#3c315b]/5",
                o.value === value ? "text-ink" : "text-soft",
              )}
            >
              {o.leading}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{o.label}</span>
                {o.hint && <span className="block truncate text-caption text-faint">{o.hint}</span>}
              </span>
              {o.value === value && <Check className="size-4 shrink-0 text-ink" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
