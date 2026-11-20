"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Prefs = {
  ready: boolean;
  favs: string[];
  compare: string[];
  notice: string;
  toggleFav: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearNotice: () => void;
};

const Ctx = createContext<Prefs | null>(null);
const FAV = "liniya.favs";
const CMP = "liniya.compare";

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [favs, setFavs] = useState<string[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      setFavs(JSON.parse(localStorage.getItem(FAV) || "[]"));
      setCompare(JSON.parse(localStorage.getItem(CMP) || "[]"));
    } catch {
      setFavs([]);
      setCompare([]);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(FAV, JSON.stringify(favs));
  }, [favs, ready]);
  useEffect(() => {
    if (ready) localStorage.setItem(CMP, JSON.stringify(compare));
  }, [compare, ready]);

  const value = useMemo<Prefs>(
    () => ({
      ready,
      favs,
      compare,
      notice,
      clearNotice: () => setNotice(""),
      toggleFav: (id) => setFavs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])),
      toggleCompare: (id) =>
        setCompare((prev) => {
          if (prev.includes(id)) return prev.filter((item) => item !== id);
          if (prev.length >= 3) {
            setNotice("В сравнении уже три квартиры. Уберите одну.");
            return prev;
          }
          setNotice("");
          return [...prev, id];
        }),
    }),
    [ready, favs, compare, notice],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("Prefs");
  return ctx;
}
