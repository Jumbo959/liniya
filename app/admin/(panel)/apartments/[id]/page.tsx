import { notFound } from "next/navigation";
import { ApartmentEditor } from "@/components/ApartmentEditor";
import { getApartment } from "@/lib/store";

export default async function EditApartmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const apartment = getApartment(id);
  if (!apartment) notFound();
  return (
    <>
      <h1 style={{ fontSize: 56, marginBottom: 16 }}>Квартира {apartment.id}</h1>
      <ApartmentEditor apartment={apartment} />
    </>
  );
}
