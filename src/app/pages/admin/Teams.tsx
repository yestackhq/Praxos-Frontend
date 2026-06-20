import { Link } from "react-router-dom";
import { SlidersHorizontal, Plus, MoreHorizontal } from "lucide-react";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { Avatar, Badge, ProgressBar } from "@/ui/data";
import { Button, buttonVariants } from "@/ui/Button";
import { EmptyState } from "@/ui/EmptyState";
import { useData } from "@/lib/data";

export default function Teams() {
  const { admin } = useData();
  const teams = admin.teams;
  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Teams"
        subtitle="Departments in your workspace. Assign learning paths to a whole team at once."
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary">
              <SlidersHorizontal className="size-4" /> Filter
            </Button>
            <Link to="/admin/teams/new" className={buttonVariants()}>
              <Plus className="size-4" /> New team
            </Link>
          </div>
        }
      />
      {teams.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No teams yet"
          body="Create a team to assign learning paths to a whole department at once."
          action={
            <Link to="/admin/teams/new" className={buttonVariants()}>
              <Plus className="size-4" /> New team
            </Link>
          }
        />
      ) : (
      <Table
        head={
          <>
            <Th>Team</Th>
            <Th>Lead</Th>
            <Th>Members</Th>
            <Th>Assigned paths</Th>
            <Th>Avg understanding</Th>
            <Th className="w-10" />
          </>
        }
      >
        {teams.map((t) => (
          <tr key={t.name} className="transition-colors hover:bg-[#3c315b]/[0.02]">
            <Td className="text-ink">
              <span className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-md border border-hairline text-caption font-medium text-soft">
                  {t.name[0]}
                </span>
                {t.name}
              </span>
            </Td>
            <Td>
              <span className="flex items-center gap-2.5">
                <Avatar name={t.lead} size={26} />
                <span className="text-ink">{t.lead}</span>
              </span>
            </Td>
            <Td className="nums">{t.members}</Td>
            <Td>
              <Badge tone="muted">{t.paths} paths</Badge>
            </Td>
            <Td>
              <span className="flex items-center gap-3">
                <span className="w-28">
                  <ProgressBar value={t.avg} />
                </span>
                <span className="nums text-label text-ink">{t.avg}</span>
              </span>
            </Td>
            <Td>
              <Link to="/admin/teams/lead" className="text-faint hover:text-ink" aria-label="Assign team lead">
                <MoreHorizontal className="size-4" />
              </Link>
            </Td>
          </tr>
        ))}
      </Table>
      )}
    </div>
  );
}
