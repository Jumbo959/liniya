import type { Metadata } from "next";
import "@fontsource/golos-text/400.css";
import "@fontsource/golos-text/500.css";
import "@fontsource/golos-text/600.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PrefsProvider } from "@/components/Prefs";
import { readDb } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Линия — аренда квартир", template: "%s — Линия" },
  description: "Долгосрочная аренда в доме «Линия»: 40 квартир с мебелью, план и 3D, без комиссии.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { settings } = readDb();
  return (
    <html lang="ru">
      <body>
        <PrefsProvider>
          <Header phone={settings.phoneDisplay} />
          <main id="main">{children}</main>
          <Footer phone={settings.phoneDisplay} email={settings.email} address={settings.address} />
        </PrefsProvider>
      </body>
    </html>
  );
}
