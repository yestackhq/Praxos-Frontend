import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, FileText } from "lucide-react";
import { Card } from "@/ui/Card";
import { ProgressBar } from "@/ui/data";
import { cn } from "@/lib/utils";
import { analyzing } from "@/lib/mock";

export default function Analyzing() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(analyzing.progress);

  // Gently advance the bar, then move on to the finished plan.
  useEffect(() => {
    const t = setInterval(() => setProgress((p) => Math.min(100, p + 4)), 600);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => navigate("/admin/documents/plan"), 700);
      return () => clearTimeout(t);
    }
  }, [progress, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-bg px-6">
      <Card className="w-full max-w-md animate-fade-up p-7">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-lg border border-hairline text-faint">
            <FileText className="size-5" />
          </span>
          <div>
            <p className="text-label text-ink">{analyzing.file}</p>
            <p className="text-caption text-faint">{analyzing.meta}</p>
          </div>
        </div>

        <h1 className="mt-6 text-h3 text-ink">Building the teaching plan</h1>
        <p className="mt-2 text-body-s text-soft">
          Praxos is reading your document and turning it into a guided course. This usually takes under a minute.
        </p>

        <ul className="mt-6 space-y-3.5">
          {analyzing.steps.map((s) => (
            <li key={s.label} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid size-4 shrink-0 place-items-center rounded-full border",
                  s.state === "done" && "border-ink bg-ink text-bg",
                  s.state === "active" && "border-ink",
                  s.state === "pending" && "border-border",
                )}
              >
                {s.state === "done" && <Check className="size-2.5" />}
                {s.state === "active" && <span className="size-1.5 rounded-full bg-ink" />}
              </span>
              <span
                className={cn(
                  "flex-1 text-label",
                  s.state === "pending" ? "text-faint" : "text-ink",
                )}
              >
                {s.label}
              </span>
              {s.note && <span className="text-caption text-faint">{s.note}</span>}
            </li>
          ))}
        </ul>

        <ProgressBar value={progress} className="mt-7" />
      </Card>
    </div>
  );
}
