import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";
import { Card } from "@/ui/Card";

/** Placeholder for screens whose design is captured but not yet built out. */
export default function Stub({ title, group }: { title: string; group?: string }) {
  return (
    <div className="animate-fade-up">
      {group && <p className="eyebrow mb-2">{group}</p>}
      <h1 className="text-h2 text-ink">{title}</h1>
      <Card className="mt-6 flex items-center gap-4 p-6 text-soft">
        <span className="grid size-10 place-items-center rounded-lg border border-hairline">
          <Hammer className="size-4" />
        </span>
        <div>
          <p className="text-label text-ink">Designed — building next</p>
          <p className="text-body-s text-faint">
            This screen is in the Figma source and queued in the rebuild. {" "}
            <Link to="/app" className="text-soft underline-offset-2 hover:text-ink hover:underline">
              Back to overview
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
