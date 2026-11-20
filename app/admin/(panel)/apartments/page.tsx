import Link from "next/link";
import { StatusMark } from "@/components/StatusMark";
import { formatArea, formatPrice } from "@/lib/format";
import { getApartments } from "@/lib/store";

export const metadata = { title: "Квартиры офиса" };

export default function AdminApartments() {
  const apartments = getApartments();
  return (
    <>
      <div className="section-head">
        <h1 style={{ fontSize: 56 }}>Квартиры</h1>
        <div className="hero-actions">
          <a className="btn-ghost" href="/export/apartments.csv">Скачать CSV</a>
          <Link className="btn" href="/admin/apartments/new">Добавить</Link>
        </div>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>№</th><th>Этаж</th><th>Комнаты</th><th>Площадь</th><th>Цена</th><th>Отделка</th><th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {apartments.map((item) => (
              <tr key={item.id}>
                <td><Link href={`/admin/apartments/${item.id}`}>{item.id}</Link></td>
                <td>{item.floor}</td>
                <td>{item.rooms}</td>
                <td>{formatArea(item.area)}</td>
                <td>{formatPrice(item.price)}</td>
                <td>{item.finishing}</td>
                <td><StatusMark status={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
