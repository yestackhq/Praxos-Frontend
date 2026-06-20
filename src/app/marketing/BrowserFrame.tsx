import { cn } from "@/lib/utils";

/** A macOS-style window chrome around a real product screenshot. */
export function BrowserFrame({
  src,
  label = "app.praxos.io",
  className,
  imgClassName,
}: {
  src: string;
  label?: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-surface shadow-2xl shadow-black/60",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-hairline px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#3c315b]/15" />
        <span className="size-2.5 rounded-full bg-[#3c315b]/15" />
        <span className="size-2.5 rounded-full bg-[#3c315b]/15" />
        <span className="mx-auto rounded-md border border-hairline px-3 py-0.5 text-caption text-faint">
          {label}
        </span>
      </div>
      <img src={src} alt="" loading="lazy" className={cn("block w-full", imgClassName)} />
    </figure>
  );
}
