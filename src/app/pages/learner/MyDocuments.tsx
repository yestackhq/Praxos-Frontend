import { FileText, Upload } from "lucide-react";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { Badge } from "@/ui/data";
import { EmptyState } from "@/ui/EmptyState";
import { Button } from "@/ui/Button";
import { useData } from "@/lib/data";

const tone = (s: string) =>
  s === "Mastered" ? "ink" : s === "Locked" ? "muted" : "outline";

export default function MyDocuments() {
  const { myDocuments } = useData();
  return (
    <div className="animate-fade-up">
      <PageHeader
        group="Learner"
        title="My documents"
        subtitle="The material assigned to you. Start a session from any assigned document."
      />
      {myDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents yet"
          body="Upload a PDF or have an admin assign one, and it will appear here ready to learn."
          action={
            <Button>
              <Upload className="size-4" /> Upload a PDF
            </Button>
          }
        />
      ) : (
      <Table
        head={
          <>
            <Th>Document</Th>
            <Th>Pages</Th>
            <Th>Status</Th>
            <Th className="text-right">Added</Th>
          </>
        }
      >
        {myDocuments.map((d) => (
          <tr key={d.name} className="transition-colors hover:bg-[#3c315b]/[0.02]">
            <Td className="text-ink">
              <span className="flex items-center gap-3">
                <span className="grid size-8 place-items-center rounded-md border border-hairline text-faint">
                  <FileText className="size-4" />
                </span>
                {d.name}
              </span>
            </Td>
            <Td className="nums">{d.pages}</Td>
            <Td>
              <Badge tone={tone(d.status)}>{d.status}</Badge>
            </Td>
            <Td className="text-right">{d.added}</Td>
          </tr>
        ))}
      </Table>
      )}
    </div>
  );
}
