"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { FloorPlan } from "./FloorPlan";
import { roomArea } from "@/lib/areas";
import type { PublicApartment } from "@/lib/types";

const Viewer3D = dynamic(() => import("./Viewer3D").then((mod) => mod.Viewer3D), {
  ssr: false,
  loading: () => <p className="viewer-loading">Собираем объём…</p>,
});

export function ApartmentStudio({ apartment }: { apartment: PublicApartment }) {
  const [tab, setTab] = useState<"plan" | "volume">("volume");
  const [selected, setSelected] = useState<number | null>(null);
  const [furniture, setFurniture] = useState(true);
  const [night, setNight] = useState(false);
  const room = selected != null ? apartment.plan[selected] : null;

  return (
    <div className="studio">
      <div className="studio-bar">
        <div className="mode">
          <button type="button" className={tab === "plan" ? "on" : ""} onClick={() => setTab("plan")}>Чертёж</button>
          <button type="button" className={tab === "volume" ? "on" : ""} onClick={() => setTab("volume")}>3D</button>
        </div>
        {tab === "volume" && (
          <div className="mode">
            <button type="button" className={furniture ? "on" : ""} onClick={() => setFurniture((v) => !v)}>Мебель</button>
            <button type="button" className={night ? "on" : ""} onClick={() => setNight((v) => !v)}>{night ? "Вечер" : "День"}</button>
          </div>
        )}
      </div>
      <div className="studio-stage">
        {tab === "plan" ? (
          <FloorPlan rooms={apartment.plan} selected={selected} onSelect={setSelected} />
        ) : (
          <>
            <Viewer3D
              rooms={apartment.plan}
              windowSides={apartment.windowSides}
              ceiling={apartment.ceiling}
              selected={selected}
              onSelect={setSelected}
              furniture={furniture}
              night={night}
            />
            <p className="viewer-help">Крутите левой кнопкой, масштаб — колесом. Клик по полу комнаты подсвечивает её и в таблице.</p>
          </>
        )}
      </div>
      <div className="table-wrap">
        <table>
          <tbody>
            {apartment.plan.map((item, index) => (
              <tr key={`${item.name}-${index}`} onClick={() => setSelected(index)} style={{ cursor: "pointer", background: selected === index ? "#f0d2c8" : undefined }}>
                <td>{item.name}</td>
                <td>{roomArea(item).toLocaleString("ru-RU")} м²</td>
                <td className="muted">{item.kind === "balcony" ? "не в площади" : "в площади"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {room && <p className="viewer-help">Сейчас: {room.name}, {room.w.toFixed(1)} × {room.d.toFixed(1)} м.</p>}
    </div>
  );
}
