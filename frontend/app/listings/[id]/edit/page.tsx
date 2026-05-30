"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import ListingForm from "../../../../components/ListingForm";
import Link from "next/link";

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [listing, setListing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchListing() {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setListing(await res.json());
      }
    }
    fetchListing();
  }, [id]);

  async function handleSubmit(data: any) {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("listing[title]", data.title);
      formData.append("listing[description]", data.description);
      formData.append("listing[price]", data.price);
      formData.append("listing[comuna]", data.comuna);
      formData.append("listing[address_text]", data.address_text);
      formData.append("listing[gastos_incluidos]", String(data.gastos_incluidos));

      if (data.lat) formData.append("listing[lat]", String(data.lat));
      if (data.lng) formData.append("listing[lng]", String(data.lng));

      // Fotos nuevas
      data.photos.forEach((file: File) => {
        formData.append("listing[photos][]", file);
      });

      // Fotos existentes
      data.existingPhotos.forEach((photo: { id: number; url: string }) => {
        formData.append("existing_photos[]", String(photo.id));
      });

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        // Redirigir a la página de detalles después de guardar
        router.push(`/listings/${id}`);
      } else {
        alert("Error al actualizar la publicación");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar la publicación");
      setSaving(false);
    }
  }

  if (!listing || authLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  // No renderizar nada si no está autenticado (ya redirigió)
  if (!user) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href={`/listings/${id}`}
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <span className="mr-2">←</span>
          <span>Volver a la publicación</span>
        </Link>
      </div>
      
      {/* Overlay de guardando */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="text-lg font-semibold text-gray-700">Guardando cambios...</p>
          </div>
        </div>
      )}
      
      <ListingForm onSubmit={handleSubmit} initialData={listing} />
    </div>
  );
}
