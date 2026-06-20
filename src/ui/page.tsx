import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  action,
  group,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  group?: string;
}) {
  return (
    <header className="mb-7 flex items-start justify-between gap-4">
      <div>
        {group && <p className="eyebrow mb-2">{group}</p>}
        <h1 className="text-h2 text-ink">{title}</h1>
        {subtitle && <p className="mt-1.5 text-body text-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

/**
 * Notion-style table: no outer border or card, just a single hairline under the
 * header and thin row dividers. Rows highlight on hover; cells get tight,
 * roomy padding. `toolbar` (filters/actions) sits to the right above the table.
 */
export function Table({
  head,
  children,
  className,
  toolbar,
}: {
  head: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  toolbar?: React.ReactNode;
}) {
  return (
    <div className={className}>
      {toolbar && <div className="mb-2 flex items-center justify-end gap-2">{toolbar}</div>}
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline text-caption text-faint">{head}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export const Th = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <th className={cn("px-3 py-2 font-medium first:pl-1 last:pr-1", className)}>{children}</th>
);
export const Td = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <td className={cn("border-b border-hairline px-3 py-3 align-middle text-label text-soft first:pl-1 last:pr-1", className)}>
    {children}
  </td>
);
