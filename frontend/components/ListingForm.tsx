"use client";

import { useState, useEffect } from "react";
import MapPicker from "@/components/MapPicker";
import AddressAutocomplete from "@/components/AddressAutocomplete";

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
    lat: null as number | null,
    lng: null as number | null,
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
      lat: initialData.lat || null,
      lng: initialData.lng || null,
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

  // 🔹 Eliminar foto nueva del preview (por índice)
  function handleRemoveNewPhoto(index: number) {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      {/* Header del formulario */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {initialData ? 'Editar publicación' : 'Nueva publicación'}
        </h2>
        <p className="text-gray-600 text-sm mt-1">Completa la información de tu propiedad</p>
      </div>

      {/* Título */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📝 Título
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none"
          placeholder="Ej: Habitación luminosa en Providencia"
          required
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📄 Descripción
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none resize-none"
          placeholder="Describe los detalles de la habitación, comodidades, cercanía al metro, etc."
          required
        />
      </div>

      {/* Grid para Precio y Comuna */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💰 Precio (CLP)
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none"
            placeholder="200000"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📍 Comuna
          </label>
          <input
            type="text"
            name="comuna"
            value={formData.comuna}
            onChange={handleChange}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all outline-none"
            placeholder="Ej: Providencia"
            required
          />
        </div>
      </div>

      {/* Dirección con autocompletado */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          🏠 Dirección
        </label>
        <AddressAutocomplete
          value={formData.address_text}
          onChange={(value) => setFormData((prev) => ({ ...prev, address_text: value }))}
          onPlaceSelect={(place) => {
            setFormData((prev) => ({
              ...prev,
              address_text: place.address,
              lat: place.lat,
              lng: place.lng,
              ...(place.comuna ? { comuna: place.comuna } : {}),
            }));
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          💡 Empieza a escribir y selecciona una dirección de las sugerencias
        </p>
      </div>

      {/* Mapa para seleccionar ubicación */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📍 Ubicación en el mapa
        </label>
        <MapPicker
          lat={formData.lat || undefined}
          lng={formData.lng || undefined}
          onLocationSelect={(lat, lng) => {
            setFormData((prev) => ({ ...prev, lat, lng }));
          }}
        />
        {formData.lat && formData.lng && (
          <p className="text-xs text-gray-600 mt-2">
            Coordenadas: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
          </p>
        )}
      </div>

      {/* Checkbox de gastos incluidos */}
      <div className="flex items-center bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
        <input
          type="checkbox"
          name="gastos_incluidos"
          checked={formData.gastos_incluidos}
          onChange={handleChange}
          className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          id="gastos"
        />
        <label htmlFor="gastos" className="ml-3 text-sm font-medium text-gray-700">
          ✓ Los gastos comunes están incluidos en el precio
        </label>
      </div>

      {/* Fotos nuevas */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          📸 Fotos {initialData ? 'nuevas' : ''}
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
              >
                <span>Sube archivos</span>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="pl-1 inline">o arrastra y suelta</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
          </div>
        </div>

        {/* 🔹 Preview de fotos nuevas seleccionadas */}
        {formData.photos.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <span className="text-green-600 mr-2">✓</span>
              {formData.photos.length} {formData.photos.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow border-2 border-green-200"
                  />
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                    Nueva
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveNewPhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg transform opacity-0 group-hover:opacity-100 transition-all"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 🔹 Preview de fotos existentes con botón eliminar */}
      {formData.existingPhotos.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Fotos actuales</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.existingPhotos.map((photo) => (
              <div key={photo.id} className="relative group">
                <img
                  src={photo.url}
                  alt="Foto"
                  className="w-full h-32 object-cover rounded-xl shadow-md group-hover:shadow-xl transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveExistingPhoto(photo.id)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-full shadow-lg transform opacity-0 group-hover:opacity-100 transition-all"
                >
                  ✖ Eliminar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de submit */}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
      >
        {initialData ? '✓ Guardar cambios' : '🚀 Publicar'}
      </button>
    </form>
  );
}
