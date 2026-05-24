"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ListingDetailPage() {
  const { id } = useParams() as { id: string };
  const [listing, setListing] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

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

  if (!listing) return <p className="text-center py-10">Cargando...</p>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Carrusel */}
      {listing.photos?.length > 0 && (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="rounded-md"
        >
          {listing.photos.map((photo: { id: number; url: string }, index: number) => (
            <SwiperSlide key={photo.id}>
              <img
                src={photo.url}
                alt={`Foto ${index + 1}`}
                className="w-full h-80 object-cover rounded-md cursor-pointer"
                onClick={() => setSelectedPhoto(photo.url)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Modal fullscreen */}
      {selectedPhoto !== null && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold hover:text-gray-300"
          >
            ✖
          </button>
          <button
            onClick={() => {
              const currentIndex = listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto);
              const prevIndex = (currentIndex - 1 + listing.photos.length) % listing.photos.length;
              setSelectedPhoto(listing.photos[prevIndex].url);
            }}
            className="absolute left-4 text-white text-3xl font-bold hover:text-gray-300"
          >
            ‹
          </button>
          <img
            src={selectedPhoto}
            alt="Foto completa"
            className="max-h-[90%] max-w-[90%] rounded-lg shadow-lg"
          />
          <button
            onClick={() => {
              const currentIndex = listing.photos.findIndex((p: { id: number; url: string }) => p.url === selectedPhoto);
              const nextIndex = (currentIndex + 1) % listing.photos.length;
              setSelectedPhoto(listing.photos[nextIndex].url);
            }}
            className="absolute right-12 text-white text-3xl font-bold hover:text-gray-300"
          >
            ›
          </button>
        </div>
      )}

      {/* Información principal */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
        <p className="text-blue-600 font-semibold text-lg mt-2">${listing.price}</p>
        <p className="text-gray-700 mt-4">{listing.description}</p>
      </div>

      {/* Badges */}
      <div className="flex gap-3 mt-4">
        <span className="bg-yellow-100 text-gray-700 px-3 py-1 rounded-full text-sm">
          {listing.comuna}
        </span>
        {listing.gastos_incluidos && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
            Gastos incluidos
          </span>
        )}
      </div>

      {/* Publicado por */}
      <p className="mt-4 text-sm text-gray-500">
        Publicado por: <span className="font-medium">{listing.user?.email}</span>
      </p>

      {/* Botones de acción */}
      <div className="mt-6 flex gap-3">
        <Link
          href={`/listings/${listing.id}/edit`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
        >
          ✏️ Editar
        </Link>

        <button
          onClick={async () => {
            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listing.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              alert("Publicación eliminada 🗑️");
              window.location.href = "/listings";
            } else {
              alert("Error al eliminar ❌");
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
        >
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
}
