"use client";

import { useState, useEffect } from "react";

export default function ListingForm({
  onSubmit,
  initialData,
}: {
  onSubmit: (data: any) => void;
  initialData?: any;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    comuna: "",
    address_text: "",
    gastos_incluidos: false,
    photos: [] as File[],                // nuevas fotos
    existingPhotos: [] as { id: number; url: string }[], // fotos ya guardadas
  });

  // Cargar datos iniciales en modo edición
  useEffect(() => {
  if (initialData) {
    setFormData((prev) => ({
      ...prev,
      title: initialData.title || "",
      description: initialData.description || "",
      price: initialData.price || "",
      comuna: initialData.comuna || "",
      address_text: initialData.address_text || "",
      gastos_incluidos: initialData.gastos_incluidos || false,
      photos: [], // nuevas fotos vacías
      existingPhotos: initialData.photos.map((p: any) => ({
        id: p.id,
        url: p.url,
      })),
    }));
  }
}, [initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFormData((prev) => ({
        ...prev,
        photos: Array.from(e.target.files),
      }));
    }
  }

  // 🔹 Eliminar foto existente del preview (por id)
  function handleRemoveExistingPhoto(id: number) {
    setFormData((prev) => ({
      ...prev,
      existingPhotos: prev.existingPhotos.filter((photo) => photo.id !== id),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      {/* Inputs igual que antes */}

      <div>
        <label className="block text-sm font-medium text-gray-700">Título</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Precio</label>
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Comuna</label>
        <input
          type="text"
          name="comuna"
          value={formData.comuna}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección</label>
        <input
          type="text"
          name="address_text"
          value={formData.address_text}
          onChange={handleChange}
          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="gastos_incluidos"
          checked={formData.gastos_incluidos}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">Gastos incluidos</label>
      </div>

      {/* Fotos nuevas */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Fotos nuevas</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500"
        />
      </div>

      {/* 🔹 Preview de fotos existentes con botón eliminar */}
      {formData.existingPhotos.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700">Fotos actuales</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {formData.existingPhotos.map((photo) => (
              <div key={photo.id} className="relative">
                <img
                  src={photo.url}
                  alt="Foto"
                  className="w-full h-32 object-cover rounded-md shadow"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(photo.id)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow"
      >
        Guardar publicación
      </button>
    </form>
  );
}
