import { ApartmentEditor } from "@/components/ApartmentEditor";

export const metadata = { title: "Новая квартира" };

export default function NewApartmentPage() {
  return (
    <>
      <h1 style={{ fontSize: 56, marginBottom: 16 }}>Новая квартира</h1>
      <ApartmentEditor apartment={null} />
    </>
  );
}
