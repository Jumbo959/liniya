"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import type { PublicApartment } from "@/lib/types";

const Viewer3D = dynamic(() => import("./Viewer3D").then((mod) => mod.Viewer3D), {
  ssr: false,
  loading: () => <p className="viewer-loading">Собираем 3D-модель…</p>,
});

export function HomePreview({ apartment }: { apartment: PublicApartment }) {
  const [night, setNight] = useState(false);
  const [furniture, setFurniture] = useState(true);
  return (
    <div className="studio home-stage">
      <div className="studio-bar">
        <span>3D · квартира {apartment.id}</span>
        <div className="mode">
          <button type="button" className={furniture ? "on" : ""} onClick={() => setFurniture((value) => !value)}>Мебель</button>
          <button type="button" className={night ? "on" : ""} onClick={() => setNight((value) => !value)}>{night ? "Вечер" : "День"}</button>
        </div>
      </div>
      <Viewer3D
        rooms={apartment.plan}
        windowSides={apartment.windowSides}
        ceiling={apartment.ceiling}
        selected={null}
        onSelect={() => undefined}
        furniture={furniture}
        night={night}
      />
      <p className="viewer-help">
        Модель крутится пальцем или мышью. <Link href={`/apartments/${apartment.id}`}>Вся квартира {apartment.id} в 3D</Link>
      </p>
    </div>
  );
}
