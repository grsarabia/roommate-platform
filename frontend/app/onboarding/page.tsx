'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token: authToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1: Información básica
    nombre: '',
    edad: '',
    genero: '',
    telefono: '',
    
    // Step 2: Tipo de usuario
    tipo_usuario: '',
    
    // Step 3: Ubicación
    ciudad: '',
    comuna: '',
    
    // Step 4: Perfil personal
    ocupacion: '',
    bio: '',
    foto_perfil: '',
    
    // Step 5: Lifestyle
    fuma: false,
    tiene_mascotas: false,
    nivel_limpieza: 3,
    nivel_ruido: 3,
    horario_trabajo: '',
    
    // Step 6: Hobbies y personalidad
    hobbies: [] as string[],
    rasgos_personalidad: [] as string[],
    
    // Step 7: Preferencias (si es demandante)
    presupuesto_min: '',
    presupuesto_max: '',
    genero_preferido: '',
    edad_min: '',
    edad_max: '',
    comunas_preferidas: [] as string[],
    acepta_fumadores: false,
    acepta_mascotas: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = authToken || localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          onboarding_completed: true,
        }),
      });

      if (response.ok) {
        router.push('/swipe');
      } else {
        alert('Error al guardar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleArrayItem = (field: string, value: string) => {
    const currentArray = formData[field as keyof typeof formData] as string[];
    if (currentArray.includes(value)) {
      updateFormData(field, currentArray.filter(item => item !== value));
    } else {
      updateFormData(field, [...currentArray, value]);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Completa tu perfil
          </h1>
          <p className="text-gray-600">
            Paso {currentStep} de {totalSteps}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Step 1: Información básica */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Información Básica</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => updateFormData('nombre', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad *
                  </label>
                  <input
                    type="number"
                    value={formData.edad}
                    onChange={(e) => updateFormData('edad', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="25"
                    min="18"
                    max="99"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género *
                  </label>
                  <select
                    value={formData.genero}
                    onChange={(e) => updateFormData('genero', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Selecciona...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                    <option value="Prefiero no decir">Prefiero no decir</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => updateFormData('telefono', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="+56 9 1234 5678"
                />
              </div>
            </div>
          )}

          {/* Step 2: Tipo de usuario */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🎯 ¿Qué buscas?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => updateFormData('tipo_usuario', 'demandante')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.tipo_usuario === 'demandante'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🏠</div>
                  <h3 className="font-bold text-lg mb-2">Busco pieza</h3>
                  <p className="text-sm text-gray-600">Necesito un lugar para vivir</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateFormData('tipo_usuario', 'ofertante')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.tipo_usuario === 'ofertante'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🔑</div>
                  <h3 className="font-bold text-lg mb-2">Ofrezco pieza</h3>
                  <p className="text-sm text-gray-600">Tengo una pieza disponible</p>
                </button>

                <button
                  type="button"
                  onClick={() => updateFormData('tipo_usuario', 'ambos')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.tipo_usuario === 'ambos'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🔄</div>
                  <h3 className="font-bold text-lg mb-2">Ambos</h3>
                  <p className="text-sm text-gray-600">Me interesa buscar y ofrecer</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ubicación */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📍 ¿Dónde te ubicas?</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={formData.ciudad}
                  onChange={(e) => updateFormData('ciudad', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Santiago"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comuna *
                </label>
                <input
                  type="text"
                  value={formData.comuna}
                  onChange={(e) => updateFormData('comuna', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Providencia"
                />
              </div>
            </div>
          )}

          {/* Step 4: Perfil personal */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">👤 Cuéntanos sobre ti</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ocupación
                </label>
                <input
                  type="text"
                  value={formData.ocupacion}
                  onChange={(e) => updateFormData('ocupacion', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Estudiante, Profesional, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => updateFormData('bio', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  placeholder="Cuéntale a otros un poco sobre ti, tus intereses, tu estilo de vida..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de foto de perfil
                </label>
                <input
                  type="url"
                  value={formData.foto_perfil}
                  onChange={(e) => updateFormData('foto_perfil', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="https://..."
                />
                {formData.foto_perfil && (
                  <div className="mt-4">
                    <img 
                      src={formData.foto_perfil} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Lifestyle */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🌟 Tu estilo de vida</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.fuma}
                    onChange={(e) => updateFormData('fuma', e.target.checked)}
                    className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="font-medium">🚬 Fumo</span>
                </label>

                <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.tiene_mascotas}
                    onChange={(e) => updateFormData('tiene_mascotas', e.target.checked)}
                    className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="font-medium">🐕 Tengo mascotas</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nivel de limpieza: <span className="text-indigo-600 font-bold">{formData.nivel_limpieza}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.nivel_limpieza}
                  onChange={(e) => updateFormData('nivel_limpieza', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>😅 Desordenado</span>
                  <span>✨ Muy ordenado</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nivel de ruido: <span className="text-indigo-600 font-bold">{formData.nivel_ruido}/5</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData.nivel_ruido}
                  onChange={(e) => updateFormData('nivel_ruido', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>🤫 Silencioso</span>
                  <span>🎉 Ruidoso</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horario de trabajo
                </label>
                <select
                  value={formData.horario_trabajo}
                  onChange={(e) => updateFormData('horario_trabajo', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Selecciona...</option>
                  <option value="diurno">☀️ Diurno (9am - 6pm)</option>
                  <option value="nocturno">🌙 Nocturno (10pm - 6am)</option>
                  <option value="mixto">🔄 Mixto / Variable</option>
                  <option value="freelance">💻 Freelance / Desde casa</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 6: Hobbies y personalidad */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🎨 Tus intereses</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Hobbies (selecciona todos los que apliquen)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Deportes', 'Música', 'Lectura', 'Cine', 'Videojuegos', 'Cocinar', 'Viajar', 'Arte', 'Tecnología', 'Fitness', 'Naturaleza', 'Fotografía'].map((hobby) => (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => toggleArrayItem('hobbies', hobby)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.hobbies.includes(hobby)
                          ? 'bg-indigo-500 text-white border-indigo-500 shadow-md'
                          : 'bg-white border-gray-300 hover:border-indigo-300'
                      }`}
                    >
                      {hobby}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Rasgos de personalidad
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Extrovertido', 'Introvertido', 'Sociable', 'Tranquilo', 'Organizado', 'Flexible', 'Responsable', 'Creativo', 'Amigable'].map((rasgo) => (
                    <button
                      key={rasgo}
                      type="button"
                      onClick={() => toggleArrayItem('rasgos_personalidad', rasgo)}
                      className={`px-4 py-2 rounded-lg border transition-all ${
                        formData.rasgos_personalidad.includes(rasgo)
                          ? 'bg-purple-500 text-white border-purple-500 shadow-md'
                          : 'bg-white border-gray-300 hover:border-purple-300'
                      }`}
                    >
                      {rasgo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Preferencias (solo para demandantes) */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {formData.tipo_usuario === 'demandante' || formData.tipo_usuario === 'ambos' 
                  ? '🔍 Tus preferencias de búsqueda' 
                  : '🎉 ¡Casi listo!'}
              </h2>
              
              {(formData.tipo_usuario === 'demandante' || formData.tipo_usuario === 'ambos') ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Presupuesto mínimo (CLP)
                      </label>
                      <input
                        type="number"
                        value={formData.presupuesto_min}
                        onChange={(e) => updateFormData('presupuesto_min', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="100000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Presupuesto máximo (CLP)
                      </label>
                      <input
                        type="number"
                        value={formData.presupuesto_max}
                        onChange={(e) => updateFormData('presupuesto_max', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="300000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Género preferido de roommate
                    </label>
                    <select
                      value={formData.genero_preferido}
                      onChange={(e) => updateFormData('genero_preferido', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Sin preferencia</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edad mínima
                      </label>
                      <input
                        type="number"
                        value={formData.edad_min}
                        onChange={(e) => updateFormData('edad_min', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="18"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Edad máxima
                      </label>
                      <input
                        type="number"
                        value={formData.edad_max}
                        onChange={(e) => updateFormData('edad_max', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="35"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.acepta_fumadores}
                        onChange={(e) => updateFormData('acepta_fumadores', e.target.checked)}
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Acepto fumadores</span>
                    </label>

                    <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-indigo-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.acepta_mascotas}
                        onChange={(e) => updateFormData('acepta_mascotas', e.target.checked)}
                        className="w-5 h-5 text-indigo-500 rounded focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="font-medium">Acepto mascotas</span>
                    </label>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-xl text-gray-700 font-semibold mb-2">
                    ¡Perfecto! Estás listo para publicar tu pieza
                  </p>
                  <p className="text-gray-500">
                    Podrás crear tu primera publicación después de completar el perfil
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            ← Anterior
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Guardando...
              </span>
            ) : currentStep === totalSteps ? (
              '¡Finalizar! 🎉'
            ) : (
              'Siguiente →'
            )}
          </button>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index + 1 === currentStep
                  ? 'w-8 bg-gradient-to-r from-indigo-500 to-purple-500'
                  : index + 1 < currentStep
                  ? 'w-2 bg-indigo-400'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
