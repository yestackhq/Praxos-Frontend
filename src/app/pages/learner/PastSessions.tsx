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
            <Th>Section</Th>
            <Th>Understanding</Th>
            <Th className="text-right">Answers</Th>
          </>
        }
      >
        {pastSessions.map((s, i) => (
          <tr key={i} className="transition-colors hover:bg-[#3c315b]/[0.02]">
            <Td className="text-ink">
              <span className="block max-w-[13rem] truncate sm:max-w-[26rem]" title={s.doc}>{s.doc}</span>
            </Td>
            <Td>{s.date}</Td>
            <Td className="nums">{s.section}</Td>
            <Td>
              {s.score == null ? (
                // Never render a missing score as 0 — "not assessed" and
                // "scored zero" are different things and the learner can act on
                // only one of them.
                <span className="text-faint" title={s.summary}>
                  Not assessed
                </span>
              ) : (
                <span
                  className={cn(
                    "nums font-medium",
                    s.score >= 80 ? "text-ink" : s.score >= 60 ? "text-soft" : "text-faint",
                  )}
                  title={s.summary}
                >
                  {s.score}
                  {s.band ? <span className="ml-2 text-caption text-faint">{s.band}</span> : null}
                </span>
              )}
            </Td>
            <Td className="nums text-right">{s.turns}</Td>
          </tr>
        ))}
      </Table>
      )}
    </div>
  );
}
