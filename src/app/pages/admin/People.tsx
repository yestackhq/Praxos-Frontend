import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, UserPlus, X, Clock } from "lucide-react";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { buttonVariants } from "@/ui/Button";
import { Avatar, Badge, ProgressBar } from "@/ui/data";
import { Dropdown } from "@/ui/Dropdown";
import { useData, useDataActions, type Person } from "@/lib/data";

const roleTone = (r: string) => (r === "Admin" ? "ink" : r === "Manager" ? "outline" : "muted");
const ROLE_OPTIONS = [
  { value: "Learner", label: "Learner" },
  { value: "Manager", label: "Manager" },
  { value: "Admin", label: "Admin" },
];

function RoleCell({ person, canEdit }: { person: Person; canEdit: boolean }) {
  const { setRole } = useDataActions();
  const [busy, setBusy] = useState(false);
  if (!canEdit || person.id == null) return <Badge tone={roleTone(person.role)}>{person.role}</Badge>;
  return (
    <Dropdown
      variant="ghost"
      size="sm"
      align="start"
      className="inline-block w-auto"
      value={person.role}
      disabled={busy}
      options={ROLE_OPTIONS}
      onChange={async (role) => {
        setBusy(true);
        try {
          await setRole(person.id!, role);
        } finally {
          setBusy(false);
        }
      }}
    />
  );
}

export default function People() {
  const { admin, role } = useData();
  const { revokeInvite } = useDataActions();
  const people = admin.people;
  const invites = admin.pendingInvites;
  const isAdmin = role === "Admin" || role === "Owner";

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="People"
        subtitle="Everyone in the workspace, what they study and how they are doing."
        action={
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-56 items-center gap-2 rounded-md border border-border px-3 text-soft">
              <Search className="size-4" />
              <input
                placeholder="Search people"
                className="w-full bg-transparent text-label text-ink outline-none placeholder:text-faint"
              />
            </div>
            <Link to="/admin/people/invite" className={buttonVariants()}>
              <UserPlus className="size-4" /> Invite
            </Link>
          </div>
        }
      />
      <Table
        head={
          <>
            <Th>Person</Th>
            <Th>Cohort</Th>
            <Th>Documents</Th>
            <Th>Understanding</Th>
            <Th>Role</Th>
            <Th className="w-10" />
          </>
        }
      >
        {people.map((p) => (
          <tr key={p.email} className="transition-colors hover:bg-[#3c315b]/[0.02]">
            <Td>
              <span className="flex items-center gap-3">
                <Avatar name={p.name || "?"} size={34} />
                <span>
                  <span className="block text-label text-ink">{p.name}</span>
                  <span className="block text-caption text-faint">{p.email}</span>
                </span>
              </span>
            </Td>
            <Td>{p.cohort}</Td>
            <Td className="nums">{p.documents}</Td>
            <Td>
              {p.role === "Admin" ? (
                <span className="text-faint">-</span>
              ) : (
                <span className="flex items-center gap-3">
                  <span className="w-24">
                    <ProgressBar value={p.understanding} />
                  </span>
                  <span className="nums text-label text-ink">{p.understanding}</span>
                </span>
              )}
            </Td>
            <Td>
              <RoleCell person={p} canEdit={isAdmin} />
            </Td>
            <Td />
          </tr>
        ))}

        {invites.map((inv) => (
          <tr key={`inv-${inv.id}`} className="text-faint">
            <Td>
              <span className="flex items-center gap-3">
                <span className="grid size-[34px] place-items-center rounded-full border border-dashed border-border">
                  <Clock className="size-4" />
                </span>
                <span>
                  <span className="block text-label text-soft">{inv.email}</span>
                  <span className="block text-caption text-faint">Invited · pending sign-up</span>
                </span>
              </span>
            </Td>
            <Td>-</Td>
            <Td>-</Td>
            <Td>-</Td>
            <Td>
              <Badge tone={roleTone(inv.role)}>{inv.role}</Badge>
            </Td>
            <Td>
              {isAdmin && (
                <button
                  onClick={() => void revokeInvite(inv.id)}
                  aria-label="Revoke invite"
                  className="text-faint hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              )}
            </Td>
          </tr>
        ))}
      </Table>

      {people.length === 1 && invites.length === 0 && (
        <p className="mt-4 text-center text-caption text-faint">
          It is just you so far. Use Invite to add teammates and admins.
        </p>
      )}
    </div>
  );
}
