"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ListingForm from "../../../../components/ListingForm";

export default function EditListingPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);

  useEffect(() => {
    async function fetchListing() {
      const token = localStorage.getItem("token"); // 🔹 obtener token
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`, // 🔹 incluir token
        },
      });
      if (res.ok) {
        setListing(await res.json());
      }
    }
    fetchListing();
  }, [id]);

  async function handleSubmit(data: any) {
    const formData = new FormData();
    formData.append("listing[title]", data.title);
    formData.append("listing[description]", data.description);
    formData.append("listing[price]", data.price);
    formData.append("listing[comuna]", data.comuna);
    formData.append("listing[address_text]", data.address_text);
    formData.append("listing[gastos_incluidos]", String(data.gastos_incluidos));

    // Fotos nuevas
    data.photos.forEach((file: File) => {
      formData.append("listing[photos][]", file);
    });

    // Fotos existentes
    data.existingPhotos.forEach((photo: { id: number; url: string }) => {
      formData.append("existing_photos[]", String(photo.id));
    });

    const token = localStorage.getItem("token"); // 🔹 obtener token
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`, // 🔹 incluir token
      },
      body: formData,
    });
  }

  if (!listing) return <p>Cargando...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Editar publicación</h1>
      <ListingForm onSubmit={handleSubmit} initialData={listing} />
    </div>
  );
}
