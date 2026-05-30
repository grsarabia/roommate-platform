"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ListingGallery from "../../components/ListingGallery";

export default function ListingsPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    async function fetchMyListings() {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          // Filtrar solo los listings del usuario actual
          const myListings = data.filter((listing: any) => listing.user_id === user.id);
          setListings(myListings);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMyListings();
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header con estadísticas */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Mis Publicaciones
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona y edita tus espacios disponibles
              </p>
            </div>
            {listings.length > 0 && (
              <Link href="/listings/new">
                <button className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center space-x-2">
                    <span className="text-2xl">📢</span>
                    <span>Nueva Publicación</span>
                  </div>
                </button>
              </Link>
            )}
          </div>

          {/* Stats Cards */}
          {listings.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-indigo-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Publicaciones</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {listings.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🏠</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Activas</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {listings.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-pink-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Vistas</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent">
                      {listings.reduce((total, listing) => total + (listing.views_count || 0), 0)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">👀</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <p className="text-gray-600 font-medium">Cargando tus publicaciones...</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          /* Empty State - Ultra Modern */
          <div className="flex items-center justify-center py-12">
            <div className="max-w-2xl w-full">
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-50 -ml-32 -mb-32"></div>
                
                {/* Content */}
                <div className="relative p-12 text-center">
                  {/* Animated Icon */}
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                    <div className="relative w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center transform hover:rotate-6 transition-transform duration-300">
                      <span className="text-6xl">🏠</span>
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    ¡Comienza tu viaje!
                  </h2>
                  
                  {/* Description */}
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed max-w-md mx-auto">
                    Crea tu primera publicación y conecta con roommates ideales que están buscando exactamente lo que ofreces.
                  </p>
                  
                  {/* CTA Button */}
                  <Link href="/listings/new">
                    <button className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center justify-center space-x-3">
                        <span className="text-2xl">📢</span>
                        <span>Crear Primera Publicación</span>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  </Link>
                  
                  {/* Benefits Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    <div className="group hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                        <span className="text-2xl">📝</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Describe tu espacio</p>
                    </div>
                    
                    <div className="group hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Recibe solicitudes</p>
                    </div>
                    
                    <div className="group hover:scale-105 transition-transform">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                        <span className="text-2xl">🤝</span>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">Encuentra roommate</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Listings Gallery */
          <div className="space-y-6">
            <ListingGallery listings={listings} />
          </div>
        )}
      </div>
    </div>
  );
}
