import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, UploadCloud, FileText, Play, Loader2 } from "lucide-react";
import { PageHeader, Table, Th, Td } from "@/ui/page";
import { Badge } from "@/ui/data";
import { Button } from "@/ui/Button";
import { useData, useDataActions } from "@/lib/data";

export default function AdminDocuments() {
  const { admin, mode } = useData();
  const { uploadFile } = useDataActions();
  const adminDocuments = admin.documents;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (mode !== "user") {
      setError("Sign in to upload documents to your workspace.");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await uploadFile(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-fade-up">
      <input ref={fileRef} type="file" accept="application/pdf,.pdf" hidden onChange={onFile} />
      <PageHeader
        title="Documents"
        subtitle={
          adminDocuments.length
            ? `${adminDocuments.length} document${adminDocuments.length === 1 ? "" : "s"}. Upload once here, then assign to people and cohorts.`
            : "Upload a PDF and Praxos indexes it for voice teaching, then you assign it."
        }
        action={
          <Button variant="secondary" onClick={pick} disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload PDF
          </Button>
        }
      />

      <button
        onClick={pick}
        disabled={busy}
        className="group mb-7 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center transition-colors hover:border-soft hover:bg-[#3c315b]/[0.02] disabled:opacity-60"
      >
        {busy ? (
          <Loader2 className="size-6 animate-spin text-soft" />
        ) : (
          <UploadCloud className="size-6 text-faint group-hover:text-soft" />
        )}
        <p className="text-title text-ink">{busy ? "Indexing your document…" : "Click to browse for a PDF"}</p>
        <p className="text-caption text-faint">
          {busy ? "Extracting and embedding the text. This can take a moment." : "We index it for voice teaching. Up to 50MB per file."}
        </p>
      </button>

      {error && (
        <p className="mb-7 -mt-3 rounded-lg border border-border bg-[#3c315b]/[0.02] px-4 py-3 text-caption text-soft">
          {error}
        </p>
      )}

      {adminDocuments.length === 0 ? (
        <p className="rounded-xl border border-hairline px-6 py-8 text-center text-body-s text-faint">
          No documents yet. Upload a PDF above to get started.
        </p>
      ) : (
        <Table
          head={
            <>
              <Th>Document</Th>
              <Th>Sections</Th>
              <Th>Assigned to</Th>
              <Th>Status</Th>
              <Th className="w-10" />
            </>
          }
        >
          {adminDocuments.map((d) => (
            <tr key={d.name} className="transition-colors hover:bg-[#3c315b]/[0.02]">
              <Td className="text-ink">
                <span className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-md border border-hairline text-faint">
                    <FileText className="size-4" />
                  </span>
                  {d.name}
                </span>
              </Td>
              <Td>{d.sections} sections</Td>
              <Td>{d.assigned} people</Td>
              <Td>
                <Badge tone={d.status === "Indexed" ? "outline" : "muted"}>
                  <span
                    className={`size-1.5 rounded-full ${d.status === "Indexed" ? "bg-ink" : "bg-faint animate-pulse"}`}
                  />
                  {d.status === "Indexing" ? "Indexing…" : d.status}
                </Badge>
              </Td>
              <Td>
                {d.status === "Indexed" && (d as { id?: number }).id != null ? (
                  <Link
                    to={`/app/session?doc=${(d as { id?: number }).id}&name=${encodeURIComponent(d.name)}`}
                    className="inline-flex items-center gap-1.5 text-caption text-soft hover:text-ink"
                  >
                    <Play className="size-3.5" /> Teach
                  </Link>
                ) : (
                  <span className="text-caption text-faint">—</span>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
