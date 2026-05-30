"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditProfilePage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [errors, setErrors] = useState<{ phone?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // 🔹 Validaciones frontend
    const newErrors: { phone?: string; password?: string } = {};
    if (phone && !/^\d{8,}$/.test(phone)) {
      newErrors.phone = "El teléfono debe tener al menos 8 dígitos numéricos.";
    }
    if (password && password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone,
          ...(password ? { password } : {}),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
        setTimeout(() => router.push("/profile"), 1500);
      } else {
        const err = await res.json();
        setMessage({ type: 'error', text: err.errors || "Error al actualizar perfil" });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: "Error de conexión con el servidor" });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link 
          href="/profile" 
          className="inline-flex items-center text-gray-600 hover:text-indigo-600 transition-colors"
        >
          <span className="mr-2">←</span>
          <span>Volver al perfil</span>
        </Link>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <span className="text-4xl">✏️</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Editar perfil</h1>
              <p className="text-indigo-100 mt-1">Actualiza tu información personal</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Mensaje de feedback */}
          {message && (
            <div className={`p-4 rounded-xl border-2 flex items-start space-x-3 ${
              message.type === 'success' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <span className="text-2xl">{message.type === 'success' ? '✅' : '⚠️'}</span>
              <p className={`font-medium ${
                message.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message.text}
              </p>
            </div>
          )}

          {/* Email (solo lectura) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📧 Email
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-500">
              {user.email}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 El email no se puede cambiar por seguridad
            </p>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📱 Teléfono
            </label>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring focus:ring-opacity-50 transition-all outline-none ${
                errors.phone 
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                  : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-200'
              }`}
              placeholder="912345678"
            />
            {errors.phone ? (
              <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.phone}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Ingresa tu número sin espacios ni guiones
              </p>
            )}
          </div>

          {/* Contraseña con toggle */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 Nueva contraseña (opcional)
            </label>
            <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-all ${
              errors.password 
                ? 'border-red-300' 
                : 'border-gray-200 focus-within:border-indigo-500 focus-within:ring focus-within:ring-indigo-200 focus-within:ring-opacity-50'
            }`}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-4 py-3 outline-none"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
              >
                {showPassword ? "🙈 Ocultar" : "👁️ Mostrar"}
              </button>
            </div>
            {errors.password ? (
              <p className="text-red-600 text-sm mt-2 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.password}</span>
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">
                Déjalo vacío si no quieres cambiar tu contraseña actual
              </p>
            )}
          </div>

          {/* Info de seguridad */}
          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              🔐 <strong>Seguridad:</strong> Por tu protección, no mostramos tu contraseña actual. 
              Si quieres cambiarla, simplemente escribe una nueva aquí.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Guardando...</span>
                </span>
              ) : (
                '💾 Guardar cambios'
              )}
            </button>
            <Link
              href="/profile"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold text-center transition-all"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
