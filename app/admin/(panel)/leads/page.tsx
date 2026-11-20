import { LeadsTable } from "@/components/LeadsTable";
import { readDb } from "@/lib/store";

export const metadata = { title: "Заявки" };

export default function LeadsPage() {
  const { leads } = readDb();
  return (
    <>
      <div className="section-head">
        <h1 style={{ fontSize: 56 }}>Заявки</h1>
        <a className="btn-ghost" href="/export/leads.csv">Скачать CSV</a>
      </div>
      <LeadsTable leads={leads} />
    </>
  );
}
