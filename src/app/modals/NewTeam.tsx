import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, ModalClose, ModalFooter } from "@/ui/Modal";
import { Button } from "@/ui/Button";
import { Avatar } from "@/ui/data";
import { Dropdown, type Option } from "@/ui/Dropdown";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/data";

const field =
  "h-10 w-full rounded-md border border-border bg-[#3c315b]/[0.02] px-3 text-label text-ink outline-none focus:border-soft";

export default function NewTeam() {
  const navigate = useNavigate();
  const { admin } = useData();
  const close = () => navigate("/admin/teams");
  const [name, setName] = useState("");

  // Team lead options come from the real workspace members.
  const leadOptions: Option[] = admin.people.map((p) => ({
    value: p.email,
    label: p.name,
    leading: <Avatar name={p.name} size={20} />,
  }));
  const [lead, setLead] = useState(leadOptions[0]?.value ?? "");

  return (
    <Modal onClose={close} className="max-w-lg" labelledBy="newteam-title">
      <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
        <h2 id="newteam-title" className="text-title text-ink">
          Create a team
        </h2>
        <ModalClose onClose={close} />
      </div>

      <div className="space-y-5 p-6">
        <div className="flex gap-3">
          <div>
            <span className="mb-1.5 block text-caption text-faint">Icon</span>
            <span className="grid size-10 place-items-center rounded-md border border-border bg-[#3c315b]/[0.02] text-label font-medium text-soft">
              {name[0]?.toUpperCase() || "T"}
            </span>
          </div>
          <label className="block flex-1">
            <span className="mb-1.5 block text-caption text-faint">Team name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engineering"
              className={field}
            />
          </label>
        </div>

        <div className="block">
          <span className="mb-1.5 block text-caption text-faint">Team lead</span>
          {leadOptions.length ? (
            <Dropdown value={lead} onChange={setLead} options={leadOptions} placeholder="Choose a lead" />
          ) : (
            <p className="rounded-md border border-dashed border-border px-3 py-2.5 text-caption text-faint">
              Invite people first, then pick a team lead.
            </p>
          )}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-caption text-faint">Description (optional)</span>
          <textarea
            rows={2}
            placeholder="What does this team work on?"
            className={cn(field, "h-auto resize-none py-2.5")}
          />
        </label>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={close}>
          Cancel
        </Button>
        <Button onClick={close} disabled={!name.trim()}>
          Create team
        </Button>
      </ModalFooter>
    </Modal>
  );
}
