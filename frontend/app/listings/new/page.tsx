"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import ListingForm from "../../../components/ListingForm";

export default function NewListingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);

  // Redirigir al login si no está autenticado
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Mostrar loading mientras verifica autenticación
  if (loading) {
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

      data.photos.forEach((file: File) => {
        formData.append("listing[photos][]", file);
      });

      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        const newListing = await res.json();
        // Redirigir a la página de detalles de la nueva publicación
        router.push(`/listings/${newListing.id}`);
      } else {
        alert("Error al crear la publicación");
        setSaving(false);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al crear la publicación");
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Overlay de guardando */}
      {saving && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <p className="text-lg font-semibold text-gray-700">Creando publicación...</p>
          </div>
        </div>
      )}
      
      <ListingForm onSubmit={handleSubmit} />
    </div>
  );
}
