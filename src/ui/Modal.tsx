import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Centered dialog over a dimmed backdrop. Esc / backdrop click runs onClose. */
export function Modal({
  onClose,
  children,
  className,
  labelledBy,
}: {
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3c315b]/30 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "animate-fade-up w-full min-w-0 rounded-2xl border border-border bg-surface shadow-2xl shadow-black/60",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className="grid size-7 place-items-center rounded-md text-faint transition-colors hover:bg-[#3c315b]/8 hover:text-ink"
    >
      <X className="size-4" />
    </button>
  );
}

/** Compact title-row modal used by the action dialogs. */
export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-hairline px-6 py-4">
      <h2 className="text-title text-ink">{title}</h2>
      <ModalClose onClose={onClose} />
    </div>
  );
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 border-t border-hairline px-6 py-4">{children}</div>;
}
