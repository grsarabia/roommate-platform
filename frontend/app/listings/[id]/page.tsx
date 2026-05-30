"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ConfirmModal from "../../../components/ConfirmModal";
import MapPicker from "../../../components/MapPicker";

export default function ListingDetailPage() {
  const { id } = useParams() as { id: string };
  const [listing, setListing] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchListing() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
      if (res.ok) {
        setListing(await res.json());
      }
    }
    fetchListing();
  }, [id]);

  // soporte teclado para modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedPhoto || !listing?.photos) return;
      const currentIndex = listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto);

      if (e.key === "Escape") {
        setSelectedPhoto(null);
      } else if (e.key === "ArrowLeft") {
        const prevIndex = (currentIndex - 1 + listing.photos.length) % listing.photos.length;
        setSelectedPhoto(listing.photos[prevIndex].url);
      } else if (e.key === "ArrowRight") {
        const nextIndex = (currentIndex + 1) % listing.photos.length;
        setSelectedPhoto(listing.photos[nextIndex].url);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto, listing]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listing.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        window.location.href = "/listings";
      } else {
        alert("Error al eliminar ❌");
        setDeleting(false);
      }
    } catch (error) {
      alert("Error de conexión ❌");
      setDeleting(false);
    }
  }

  if (!listing) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/listings"
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <span className="mr-2">←</span>
          <span>Volver a publicaciones</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Galería de fotos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carrusel de fotos */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {listing.photos?.length > 0 ? (
              <Swiper
                modules={[Navigation, Pagination]}
                navigation
                pagination={{ clickable: true }}
                loop={true}
                className="rounded-2xl"
              >
                {listing.photos.map((photo: { id: number; url: string }, index: number) => (
                  <SwiperSlide key={photo.id}>
                    <div className="relative group" onClick={() => setSelectedPhoto(photo.url)}>
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-96 object-cover cursor-pointer"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center pointer-events-none">
                        <span className="text-white text-lg font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          🔍 Ver imagen completa
                        </span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <span className="text-8xl block mb-4">🏠</span>
                  <p className="text-gray-600">Sin fotos disponibles</p>
                </div>
              </div>
            )}
          </div>

          {/* Descripción detallada */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Descripción</h2>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Mapa de ubicación */}
          {listing.lat && listing.lng && (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ubicación</h2>
              </div>
              <MapPicker lat={listing.lat} lng={listing.lng} readOnly={true} />
            </div>
          )}
        </div>

        {/* Columna derecha - Info y acciones */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card de información principal */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 sticky top-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {listing.title}
            </h1>

            {/* Precio destacado */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 shadow-lg">
              <p className="text-white/80 text-sm font-medium mb-1">Precio mensual</p>
              <p className="text-white text-4xl font-bold">
                ${listing.price.toLocaleString()}
              </p>
              <p className="text-white/80 text-xs mt-2">CLP por mes</p>
            </div>

            {/* Detalles */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-xs text-amber-700 font-medium">Ubicación</p>
                  <p className="text-gray-900 font-semibold">{listing.comuna}</p>
                  {listing.address_text && (
                    <p className="text-xs text-gray-600 mt-1">{listing.address_text}</p>
                  )}
                </div>
              </div>

              {listing.gastos_incluidos && (
                <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-gray-900 font-semibold">Gastos incluidos</p>
                    <p className="text-xs text-gray-600">Luz, agua y gas común</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Publicado por</p>
                  <p className="text-gray-900 font-semibold">{listing.user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📅</span>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Fecha de publicación</p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(listing.created_at).toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <button
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <span className="text-xl">💬</span>
                <span>Contactar</span>
              </button>

              <Link
                href={`/listings/${listing.id}/edit`}
                className="block w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-center"
              >
                ✏️ Editar publicación
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2"
              >
                <span className="text-xl">🗑️</span>
                <span>Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal fullscreen para fotos */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[9999] animate-fade-in" onClick={() => setSelectedPhoto(null)}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white text-2xl font-bold transition-all"
          >
            ✖
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto);
              const prevIndex = (currentIndex - 1 + listing.photos.length) % listing.photos.length;
              setSelectedPhoto(listing.photos[prevIndex].url);
            }}
            className="absolute left-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <img
            src={selectedPhoto}
            alt="Foto completa"
            className="max-h-[90%] max-w-[90%] rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto);
              const nextIndex = (currentIndex + 1) % listing.photos.length;
              setSelectedPhoto(listing.photos[nextIndex].url);
            }}
            className="absolute right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div 
            className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto) + 1} / {listing.photos.length}
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <ConfirmModal
          title="¿Eliminar publicación?"
          message="Esta acción no se puede deshacer. La publicación se eliminará permanentemente."
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          confirmText={deleting ? "Eliminando..." : "Sí, eliminar"}
          cancelText="Cancelar"
          loading={deleting}
        />
      )}
    </div>
  );
}
