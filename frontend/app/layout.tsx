"use client";

import "./globals.css";
import Loader from "../components/Loader";
import Link from "next/link";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { GoogleMapsProvider } from "../context/GoogleMapsContext";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();

  return (
    <>
      {/* Loader global */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader />
        </div>
      ) : (
        <>
          {/* Navbar moderno con gradiente */}
          <header className="bg-white shadow-lg sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex justify-between items-center">
                {/* Logo con gradiente */}
                <Link href="/" className="flex items-center space-x-2 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h1 className="text-2xl font-bold gradient-text hidden sm:block">
                    Roomies Chile
                  </h1>
                </Link>

                {/* Navegación */}
                <nav className="flex items-center space-x-2 sm:space-x-4">
                  <Link 
                    href="/listings" 
                    className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-all"
                  >
                    <span className="hidden sm:inline">📋 </span>Mis publicaciones
                  </Link>
                  
                  {user && (
                    <>
                      <Link 
                        href="/swipe" 
                        className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-all"
                      >
                        <span className="hidden sm:inline">✨ </span>Descubrir
                      </Link>
                      <Link 
                        href="/matches" 
                        className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium rounded-lg hover:bg-purple-50 transition-all"
                      >
                        <span className="hidden sm:inline">📊 </span>Dashboard
                      </Link>
                      <Link 
                        href="/listings/new" 
                        className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium rounded-lg hover:bg-green-50 transition-all"
                      >
                        <span className="hidden sm:inline">➕ </span>Crear
                      </Link>
                      <Link 
                        href="/profile" 
                        className="px-4 py-2 text-gray-700 hover:text-pink-600 font-medium rounded-lg hover:bg-pink-50 transition-all"
                      >
                        <span className="hidden sm:inline">👤 </span>Perfil
                      </Link>
                    </>
                  )}

                  {/* Auth buttons */}
                  {user ? (
                    <div className="flex items-center space-x-3 ml-4 border-l pl-4">
                      <div className="hidden md:flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {user.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm text-gray-700 font-medium">
                          {user.email.split('@')[0]}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                      >
                        Salir
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      className="ml-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                      Iniciar sesión
                    </Link>
                  )}
                </nav>
              </div>
            </div>
          </header>

          {/* Contenido principal */}
          <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>

          {/* Footer moderno */}
          <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-16">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🏠</span>
                  <span className="font-bold text-lg">Roomies Chile</span>
                </div>
                <p className="text-gray-400 text-sm">
                  © 2026 Roomies Chile · Encuentra tu hogar ideal
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    📧 Contacto
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    ℹ️ Acerca de
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gradient-to-br from-slate-50 to-gray-100 text-gray-800 min-h-screen flex flex-col">
        <GoogleMapsProvider>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
          </AuthProvider>
        </GoogleMapsProvider>
      </body>
    </html>
  );
}
