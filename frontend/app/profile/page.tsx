"use client";

import { useAuth } from "../../hooks/useAuth";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
        <span className="text-6xl block mb-4">🔒</span>
        <p className="text-gray-600 text-lg">No hay sesión activa</p>
        <Link
          href="/login"
          className="inline-block mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const userInitial = user.email[0].toUpperCase();
  const memberSince = new Date(user.created_at).toLocaleDateString('es-CL', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Card con Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-xl overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700"></div>
        <div className="px-8 pb-8 -mt-16 relative">
          {/* Avatar grande */}
          <div className="flex items-end space-x-6">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-2xl flex items-center justify-center border-4 border-white">
                <span className="text-5xl font-bold text-indigo-600">{userInitial}</span>
              </div>
              {user.verified_email && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 shadow-lg border-4 border-white">
                  <span className="text-white text-sm">✓</span>
                </div>
              )}
            </div>
            
            {/* Info de usuario */}
            <div className="flex-1 pb-4">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user.email.split('@')[0]}
              </h1>
              <p className="text-indigo-100 flex items-center space-x-2">
                <span>📅</span>
                <span>Miembro desde {memberSince}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información Personal */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👤</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">📧</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Email</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
              <span className="text-2xl">📱</span>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium mb-1">Teléfono</p>
                <p className="text-gray-900 font-medium">
                  {user.phone || <span className="text-gray-400 italic">No registrado</span>}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <p className="text-xs text-indigo-600 font-medium mb-1">Rol</p>
                <span className="inline-block px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full text-sm font-bold shadow-md">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verificaciones */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verificaciones</h2>
          </div>
          
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border-2 ${
              user.verified_email 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{user.verified_email ? '✅' : '⚠️'}</span>
                  <div>
                    <p className="font-bold text-gray-900">Email verificado</p>
                    <p className="text-xs text-gray-600">
                      {user.verified_email ? 'Tu email está confirmado' : 'Verifica tu email'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`p-4 rounded-xl border-2 ${
              user.verified_id 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{user.verified_id ? '✅' : '⚠️'}</span>
                  <div>
                    <p className="font-bold text-gray-900">Identidad verificada</p>
                    <p className="text-xs text-gray-600">
                      {user.verified_id ? 'Tu identidad está confirmada' : 'Verifica tu identidad'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {(!user.verified_email || !user.verified_id) && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  💡 <strong>Consejo:</strong> Verifica tu cuenta para acceder a todas las funcionalidades
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/profile/edit"
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <span className="text-xl">✏️</span>
            <span>Editar perfil</span>
          </Link>
          
          <Link
            href="/listings"
            className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            <span className="text-xl">🏠</span>
            <span>Mis publicaciones</span>
          </Link>
          
          <button
            className="flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            onClick={() => alert("Funcionalidad en construcción 🚧")}
          >
            <span className="text-xl">🔒</span>
            <span>Cambiar contraseña</span>
          </button>
        </div>
      </div>
    </div>
  );
}
