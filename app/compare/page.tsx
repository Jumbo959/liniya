import { SavedList } from "@/components/SavedList";
import { getPublicApartments } from "@/lib/store";

export const metadata = { title: "Сравнение" };

export default function ComparePage() {
  return <SavedList apartments={getPublicApartments()} mode="compare" />;
}
