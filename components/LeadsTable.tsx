"use client";

import { useState } from "react";
import { updateLead } from "@/lib/actions";
import { formatDateTime, leadStatusLabel, leadTypeLabel } from "@/lib/format";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUSES: LeadStatus[] = ["new", "call", "meeting", "reserved", "won", "lost"];

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const [rows, setRows] = useState(leads);
  const [filter, setFilter] = useState<LeadStatus | "all">("all");
  const shown = filter === "all" ? rows : rows.filter((lead) => lead.status === filter);

  async function patch(id: string, status?: LeadStatus, managerNote?: string) {
    await updateLead(id, { status, managerNote });
    setRows((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status: status ?? lead.status, managerNote: managerNote ?? lead.managerNote } : lead)));
  }

  return (
    <div>
      <div className="chips" style={{ marginBottom: 14 }}>
        <button type="button" className={filter === "all" ? "on" : ""} onClick={() => setFilter("all")}>все</button>
        {STATUSES.map((status) => (
          <button key={status} type="button" className={filter === status ? "on" : ""} onClick={() => setFilter(status)}>
            {leadStatusLabel(status)}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Заявка</th><th>Кто</th><th>Тип</th><th>Квартира</th><th className="wrap-cell">Текст</th><th>Статус</th><th className="wrap-cell">Заметка</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.id}<br /><span className="muted">{formatDateTime(lead.createdAt)}</span></td>
                <td className="wrap-cell">{lead.name}<br />{lead.phone}<br />{lead.email}</td>
                <td>{leadTypeLabel(lead.type)}<br /><span className="muted">{lead.time}</span></td>
                <td>{lead.apartmentId ?? "—"}</td>
                <td className="wrap-cell">{lead.message}</td>
                <td>
                  <select value={lead.status} onChange={(e) => patch(lead.id, e.target.value as LeadStatus)}>
                    {STATUSES.map((status) => <option key={status} value={status}>{leadStatusLabel(status)}</option>)}
                  </select>
                </td>
                <td className="wrap-cell">
                  <textarea defaultValue={lead.managerNote} onBlur={(e) => patch(lead.id, undefined, e.target.value)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
