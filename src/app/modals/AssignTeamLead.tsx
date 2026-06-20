import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/data";
import { cn } from "@/lib/utils";
import { teamLeadCandidates } from "@/lib/mock";

export default function AssignTeamLead() {
  const navigate = useNavigate();
  const close = () => navigate("/admin/teams");
  const [picked, setPicked] = useState(teamLeadCandidates[0]!.name);
  const [q, setQ] = useState("");

  const list = teamLeadCandidates.filter((m) => m.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="lead-title">
      <div className="flex items-start justify-between border-b border-hairline px-6 py-4">
        <div>
          <h2 id="lead-title" className="text-title text-ink">
            Assign team lead
          </h2>
          <p className="text-caption text-faint">Choose who leads Engineering.</p>
        </div>
        <ModalClose onClose={close} />
      </div>

      <div className="p-6">
        <div className="mb-3 flex h-10 items-center gap-2 rounded-md border border-border px-3 text-soft">
          <Search className="size-4" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members"
            className="w-full bg-transparent text-label text-ink outline-none placeholder:text-faint"
          />
        </div>

        <ul className="max-h-72 space-y-1 overflow-y-auto">
          {list.map((m) => {
            const on = picked === m.name;
            return (
              <li key={m.name}>
                <button
                  onClick={() => setPicked(m.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                    on ? "bg-[#3c315b]/8" : "hover:bg-[#3c315b]/5",
                  )}
                >
                  <Avatar name={m.name} size={34} />
                  <div className="min-w-0 flex-1">
                    <p className="text-label text-ink">{m.name}</p>
                    <p className="text-caption text-faint">
                      {m.role} · {m.score}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "grid size-4 place-items-center rounded-full border",
                      on ? "border-ink" : "border-border",
                    )}
                  >
                    {on && <span className="size-2 rounded-full bg-ink" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button onClick={close}>Make team lead</Button>
      </ModalFooter>
    </Modal>
  );
}
