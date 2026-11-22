import Link from "next/link";
import { formatDateTime, formatPrice, leadStatusLabel, leadTypeLabel } from "@/lib/format";
import { readDb } from "@/lib/store";

export const metadata = { title: "Обзор офиса" };

export default function AdminHome() {
  const db = readDb();
  const list = db.apartments;
  const available = list.filter((item) => item.status === "available");
  const reserved = list.filter((item) => item.status === "reserved");
  const sold = list.filter((item) => item.status === "sold");
  const sum = available.reduce((acc, item) => acc + item.price, 0);
  const perM = available.length ? available.reduce((acc, item) => acc + item.price / item.area, 0) / available.length : 0;
  const total = list.length || 1;

  return (
    <>
      <p className="kicker">сегодня</p>
      <h1 style={{ fontSize: 64, marginBottom: 18 }}>Обзор</h1>
      <div className="stats">
        <div className="stat"><span className="muted">Свободно</span><b>{available.length}</b></div>
        <div className="stat"><span className="muted">Бронь</span><b>{reserved.length}</b></div>
        <div className="stat"><span className="muted">Занято</span><b>{sold.length}</b></div>
        <div className="stat"><span className="muted">Сумма свободных</span><b>{formatPrice(sum)}</b></div>
      </div>
      <div className="mix" aria-hidden="true">
        <i style={{ width: `${(available.length / total) * 100}%`, background: "#24312b" }} />
        <i style={{ width: `${(reserved.length / total) * 100}%`, background: "#9c4032" }} />
        <i style={{ width: `${(sold.length / total) * 100}%`, background: "#b9b2a6" }} />
      </div>
      <p className="muted">Средняя цена свободных — {formatPrice(perM)} за м². Новых заявок: {db.leads.filter((lead) => lead.status === "new").length}.</p>
      <div className="split" style={{ marginTop: 28 }}>
        <div>
          <h2 style={{ fontSize: 40, marginBottom: 12 }}>Заявки</h2>
          <div className="table-wrap">
            <table>
              <tbody>
                {db.leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}<br /><span className="muted">{formatDateTime(lead.createdAt)}</span></td>
                    <td>{leadTypeLabel(lead.type)} {lead.apartmentId ?? ""}</td>
                    <td>{leadStatusLabel(lead.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><Link href="/admin/leads">Все заявки</Link></p>
        </div>
        <div>
          <h2 style={{ fontSize: 40, marginBottom: 12 }}>Журнал</h2>
          <ul>
            {db.events.slice(0, 8).map((event) => (
              <li key={event.at + event.text}><span className="muted">{formatDateTime(event.at)}. </span>{event.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
