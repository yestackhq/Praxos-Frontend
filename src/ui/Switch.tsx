import { useState } from "react";
import { cn } from "@/lib/utils";

export function Switch({ defaultOn = false, onChange }: { defaultOn?: boolean; onChange?: (on: boolean) => void }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => {
        setOn(!on);
        onChange?.(!on);
      }}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full border transition-colors",
        on ? "border-transparent bg-ink" : "border-border bg-[#3c315b]/8",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 size-4 rounded-full transition-all",
          on ? "left-[22px] bg-bg" : "left-0.5 bg-soft",
        )}
      />
    </button>
  );
}
