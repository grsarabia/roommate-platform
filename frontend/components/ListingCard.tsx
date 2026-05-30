"use client";

import Link from "next/link";

export default function ListingCard({ listing }: { listing: any }) {
  return (
    <div className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
      {/* Imagen principal con overlay */}
      <div className="relative overflow-hidden">
        {listing.photos?.[0] ? (
          <>
            <img
              src={listing.photos[0].url}
              alt={listing.title}
              className="w-full h-56 object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            {/* Overlay con gradiente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
            <span className="text-6xl">🏠</span>
          </div>
        )}
        
        {/* Badge de vistas flotante - izquierda */}
        <div className="absolute top-4 left-4 bg-gradient-to-r from-indigo-500 to-purple-500 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5">
          <span className="text-lg drop-shadow-md" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' }}>👁️</span>
          <span className="text-white font-bold text-sm">{listing.views_count || 0}</span>
        </div>
        
        {/* Badge de precio flotante */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <p className="text-indigo-600 font-bold text-lg">${listing.price.toLocaleString()}</p>
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-5">
        {/* Título */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
          {listing.title}
        </h2>

        {/* Descripción */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {listing.description}
        </p>

        {/* Badges modernos */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 px-3 py-1 rounded-full text-xs font-medium border border-amber-200">
            📍 {listing.comuna}
          </span>
          {listing.gastos_incluidos && (
            <span className="inline-flex items-center bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium border border-emerald-200">
              ✓ Gastos incluidos
            </span>
          )}
        </div>

        {/* Botón de acción moderno */}
        <Link
          href={`/listings/${listing.id}`}
          className="block w-full text-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium shadow-md hover:shadow-lg transform transition-all duration-200"
        >
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}
