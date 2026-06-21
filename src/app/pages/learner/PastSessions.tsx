import { History } from "lucide-react";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { EmptyState } from "@/ui/EmptyState";
import { useData } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function PastSessions() {
  const { pastSessions } = useData();
  return (
    <div className="animate-fade-up">
      <PageHeader
        group="Learner"
        title="Past sessions"
        subtitle="Every session you have completed, and how well you did."
      />
      {pastSessions.length === 0 ? (
        <EmptyState
          icon={History}
          title="No sessions yet"
          body="Once you complete your first spoken session, it shows up here with your understanding score."
        />
      ) : (
      <Table
        head={
          <>
            <Th>Document</Th>
            <Th>Date</Th>
            <Th>Understanding</Th>
            <Th>Topics</Th>
            <Th className="text-right">Duration</Th>
          </>
        }
      >
        {pastSessions.map((s, i) => (
          <tr key={i} className="transition-colors hover:bg-[#3c315b]/[0.02]">
            <Td className="text-ink">
              <span className="block max-w-[13rem] truncate sm:max-w-[26rem]" title={s.doc}>{s.doc}</span>
            </Td>
            <Td>{s.date}</Td>
            <Td>
              <span
                className={cn(
                  "nums font-medium",
                  s.score >= 80 ? "text-ink" : s.score >= 60 ? "text-soft" : "text-faint",
                )}
              >
                {s.score}
              </span>
            </Td>
            <Td className="nums">{s.topics}</Td>
            <Td className="nums text-right">{s.duration}</Td>
          </tr>
        ))}
      </Table>
      )}
    </div>
  );
}
