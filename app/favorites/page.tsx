import { SavedList } from "@/components/SavedList";
import { getPublicApartments } from "@/lib/store";

export const metadata = { title: "Избранное" };

export default function FavoritesPage() {
  return <SavedList apartments={getPublicApartments()} mode="fav" />;
}
