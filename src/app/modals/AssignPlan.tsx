import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown } from "lucide-react";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { cn } from "@/lib/utils";
import { assignTargets } from "@/lib/mock";

type Tab = "People" | "Teams" | "Cohorts";
const tabs: Tab[] = ["People", "Teams", "Cohorts"];

export default function AssignPlan() {
  const navigate = useNavigate();
  const close = () => navigate("/admin/documents/plan");
  const [tab, setTab] = useState<Tab>("Teams");
  const [picked, setPicked] = useState<string[]>(["Engineering", "Operations"]);

  const toggle = (name: string) =>
    setPicked((p) => (p.includes(name) ? p.filter((x) => x !== name) : [...p, name]));

  const items = assignTargets[tab];
  const noun = tab.toLowerCase();

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="assign-title">
      <div className="flex items-start justify-between border-b border-hairline px-6 py-4">
        <div>
          <h2 id="assign-title" className="text-title text-ink">
            Assign teaching plan
          </h2>
          <p className="text-caption text-faint">Data protection & GDPR · 5 modules</p>
        </div>
        <ModalClose onClose={close} />
      </div>

      <div className="p-6">
        <div className="mb-4 flex rounded-md border border-border p-0.5 text-caption">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "flex-1 rounded px-3 py-1.5 transition-colors",
                t === tab ? "bg-[#3c315b]/10 text-ink" : "text-faint hover:text-soft",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <ul className="max-h-64 space-y-1 overflow-y-auto">
          {items.map((it) => {
            const on = picked.includes(it.name);
            return (
              <li key={it.name}>
                <button
                  onClick={() => toggle(it.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    on ? "bg-[#3c315b]/8" : "hover:bg-[#3c315b]/5",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-md border",
                      on ? "border-transparent bg-ink text-bg" : "border-border",
                    )}
                  >
                    {on && <Check className="size-3.5" />}
                  </span>
                  {it.badge && (
                    <span className="grid size-7 place-items-center rounded-md border border-hairline text-caption font-medium text-soft">
                      {it.badge}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-label text-ink">{it.name}</p>
                    <p className="text-caption text-faint">{it.meta}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-caption text-faint">Due date</span>
          <div className="relative">
            <select className="h-10 w-full appearance-none rounded-md border border-border bg-[#3c315b]/[0.02] px-3 pr-9 text-label text-ink outline-none focus:border-soft" defaultValue="In 2 weeks">
              <option>In 1 week</option>
              <option>In 2 weeks</option>
              <option>In 30 days</option>
              <option>No due date</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 size-4 text-faint" />
          </div>
        </label>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button onClick={close}>
          Assign to {picked.length} {noun}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
