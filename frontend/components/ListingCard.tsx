"use client";

import Link from "next/link";

export default function ListingCard({ listing }: { listing: any }) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-4">
      {/* Imagen principal */}
      {listing.photos?.[0] && (
        <img
          src={listing.photos[0].url}
          alt={listing.title}
          className="w-full h-48 object-cover rounded-md"
        />
      )}

      {/* Título y precio */}
      <div className="mt-3">
        <h2 className="text-lg font-semibold text-gray-900">{listing.title}</h2>
        <p className="text-blue-600 font-bold mt-1">${listing.price}</p>
      </div>

      {/* Descripción resumida */}
      <p className="text-gray-600 mt-2 line-clamp-2">{listing.description}</p>

      {/* Badges */}
      <div className="flex gap-2 mt-3">
        <span className="bg-yellow-100 text-gray-700 px-2 py-1 rounded text-xs">
          {listing.comuna}
        </span>
        {listing.gastos_incluidos && (
          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
            Gastos incluidos
          </span>
        )}
      </div>

      {/* Botón de acción */}
      <Link
        href={`/listings/${listing.id}`}
        className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
      >
        Ver detalle
      </Link>
    </div>
  );
}
