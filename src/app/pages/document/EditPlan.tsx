import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GripVertical, X, Plus, Copy } from "lucide-react";
import { Card } from "@/ui/Card";
import { Button } from "@/ui/Button";
import { teachingPlan } from "@/lib/mock";

type Mod = { title: string; topics: string[]; minutes: number };

export default function EditPlan() {
  const navigate = useNavigate();
  const [mods, setMods] = useState<Mod[]>(
    teachingPlan.modules.map((m) => ({ title: m.title, topics: m.topics.slice(0, 3), minutes: m.minutes })),
  );

  const update = (i: number, patch: Partial<Mod>) =>
    setMods((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const removeTopic = (i: number, t: string) =>
    update(i, { topics: mods[i]!.topics.filter((x) => x !== t) });
  const addModule = () =>
    setMods((ms) => [...ms, { title: "New module", topics: [], minutes: 5 }]);

  return (
    <div className="animate-fade-up">
      <header className="mb-7 flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-2.5 py-1 text-caption text-soft">
            <span className="size-1.5 animate-pulse rounded-full bg-ink" /> Editing
          </span>
          <h1 className="mt-3 text-h3 text-ink">{teachingPlan.doc}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="ghost" onClick={() => navigate("/admin/documents/plan")}>
            Cancel
          </Button>
          <Button onClick={() => navigate("/admin/documents/plan")}>Save plan</Button>
        </div>
      </header>

      <ol className="space-y-3">
        {mods.map((m, i) => (
          <li key={i}>
            <Card className="flex items-start gap-3 p-4">
              <span className="flex items-center gap-2 pt-2 text-faint">
                <GripVertical className="size-4 cursor-grab" />
                <span className="text-label text-soft">{i + 1}</span>
              </span>
              <div className="min-w-0 flex-1">
                <input
                  value={m.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  className="w-full rounded-md border border-hairline bg-[#3c315b]/[0.02] px-3 py-2 text-label text-ink outline-none focus:border-border"
                />
                <div className="mt-2.5 flex flex-wrap items-center gap-2">
                  {m.topics.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-caption text-soft"
                    >
                      {t}
                      <button onClick={() => removeTopic(i, t)} className="text-faint hover:text-ink">
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                  <button className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-caption text-faint hover:border-soft hover:text-soft">
                    <Plus className="size-3" /> Add topic
                  </button>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 pt-1">
                <span className="flex items-center gap-1 rounded-md border border-hairline px-2 py-1.5 text-caption text-soft">
                  <input
                    value={m.minutes}
                    onChange={(e) => update(i, { minutes: Number(e.target.value) || 0 })}
                    className="nums w-5 bg-transparent text-right text-ink outline-none"
                  />
                  min
                </span>
                <button className="grid size-8 place-items-center rounded-md border border-hairline text-faint hover:text-ink">
                  <Copy className="size-3.5" />
                </button>
              </div>
            </Card>
          </li>
        ))}
      </ol>

      <button
        onClick={addModule}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-4 text-label text-faint transition-colors hover:border-soft hover:text-soft"
      >
        <Plus className="size-4" /> Add a module
      </button>
    </div>
  );
}
