import type { ApartmentStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

export function StatusMark({ status }: { status: ApartmentStatus }) {
  return <span className={`status status-${status}`}>{statusLabel(status)}</span>;
}
