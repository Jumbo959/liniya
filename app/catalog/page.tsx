import { CatalogExplorer } from "@/components/CatalogExplorer";
import { getPublicApartments } from "@/lib/store";

export const metadata = { title: "Квартиры" };

export default function CatalogPage() {
  return <CatalogExplorer apartments={getPublicApartments()} initial={{}} />;
}
