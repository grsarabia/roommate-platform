'use client';

import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface SwipeCardProps {
  card: {
    id: number;
    type: 'user' | 'listing';
    nombre?: string;
    titulo?: string;
    edad?: number;
    genero?: string;
    ciudad?: string;
    comuna?: string;
    ocupacion?: string;
    bio?: string;
    foto_perfil?: string;
    fotos?: string[];
    precio?: number;
    direccion?: string;
    num_habitaciones?: number;
    compatibility_score?: number;
    hobbies?: string[];
    nivel_limpieza?: number;
    nivel_ruido?: number;
    owner?: {
      id: number;
      nombre: string;
      edad: number;
      genero: string;
      foto_perfil: string;
      bio: string;
      ocupacion: string;
      nivel_limpieza: number;
      nivel_ruido: number;
      horarios: string;
      tiene_mascota: boolean;
      es_fumador: boolean;
      hobbies: string[];
      personalidad: string[];
    };
  };
  onSwipe: (direction: 'left' | 'right') => void;
  onCardExit?: () => void;
}

export default function SwipeCard({ card, onSwipe, onCardExit }: SwipeCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Color indicators for swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swipe right - LIKE
      onSwipe('right');
      onCardExit?.();
    } else if (info.offset.x < -threshold) {
      // Swipe left - NOPE
      onSwipe('left');
      onCardExit?.();
    }
  };

  const photos = card.type === 'listing' ? card.fotos : [card.foto_perfil];
  const displayPhotos = photos?.filter(Boolean) || [];
  const hasMultiplePhotos = displayPhotos.length > 1;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  return (
    <motion.div
      className="absolute w-full h-full"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: 'grabbing' }}
      dragListener={!showOwnerModal}
    >
      <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing">
        {/* LIKE/NOPE Overlays */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 right-12 z-20 px-6 py-3 border-4 border-green-500 rounded-xl rotate-12 pointer-events-none"
        >
          <span className="text-5xl font-bold text-green-500">ME GUSTA</span>
        </motion.div>

        <motion.div
          style={{ opacity: nopeOpacity }}
          className="absolute top-12 left-12 z-20 px-6 py-3 border-4 border-red-500 rounded-xl -rotate-12 pointer-events-none"
        >
          <span className="text-5xl font-bold text-red-500">NO ME GUSTA</span>
        </motion.div>

        {/* Compatibility Score Badge */}
        {card.compatibility_score !== undefined && card.compatibility_score > 0 && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg">
            <span className="text-white font-bold text-lg">
              ✨ {card.compatibility_score}% Match
            </span>
          </div>
        )}

        {/* Photo Section */}
        <div className="relative w-full h-2/3 bg-gray-200 pointer-events-none">
          {displayPhotos.length > 0 ? (
            <>
              <img
                src={displayPhotos[currentPhotoIndex] || '/placeholder.svg'}
                alt={card.type === 'listing' ? card.titulo : card.nombre}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              
              {/* Photo Navigation Dots */}
              {hasMultiplePhotos && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {displayPhotos.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all ${
                        index === currentPhotoIndex
                          ? 'w-8 bg-white'
                          : 'w-2 bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}

              {/* Photo Navigation Arrows */}
              {hasMultiplePhotos && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevPhoto();
                    }}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all pointer-events-auto"
                  >
                    ←
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextPhoto();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white transition-all pointer-events-auto"
                  >
                    →
                  </button>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
              <span className="text-6xl">
                {card.type === 'listing' ? '🏠' : '👤'}
              </span>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="h-1/3 p-4">
          {card.type === 'listing' ? (
            <>
              {/* Listing Info */}
              <div className="mb-2">
                <h2 className="text-xl font-bold text-gray-800 mb-0.5 leading-tight">
                  {card.titulo || 'Sin título'}
                </h2>
                <p className="text-lg font-semibold text-indigo-600 mb-0.5">
                  ${card.precio?.toLocaleString('es-CL') || '0'}/mes
                </p>
                <p className="text-sm text-gray-600">
                  📍 {card.comuna}, {card.ciudad}
                  {card.num_habitaciones && ` • 🏠 ${card.num_habitaciones} hab.`}
                </p>
              </div>

              {/* Owner Info - Simplified with Modal Button */}
              {card.owner && (
                <div className="p-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-full bg-indigo-200 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                        {card.owner.foto_perfil ? (
                          <img 
                            src={card.owner.foto_perfil} 
                            alt={card.owner.nombre}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{card.owner.genero === 'M' ? '👨' : card.owner.genero === 'F' ? '👩' : '👤'}</span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-800 text-sm leading-tight">
                          {card.owner.nombre}, {card.owner.edad} años
                        </p>
                        <p className="text-xs text-gray-600 truncate">{card.owner.ocupacion}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowOwnerModal(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition-colors flex-shrink-0"
                    >
                      Ver perfil
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {card.nivel_limpieza && (
                  <div>
                    <span className="text-sm text-gray-500">Limpieza:</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.nivel_limpieza! ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {card.nivel_ruido && (
                  <div>
                    <span className="text-sm text-gray-500">Ambiente:</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.nivel_ruido! ? 'bg-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* User Info */}
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {card.nombre || 'Usuario'}, {card.edad || '?'}
                </h2>
                <p className="text-gray-600">
                  {card.genero === 'M' ? '👨' : card.genero === 'F' ? '👩' : '👤'} {card.ocupacion || 'No especificado'}
                </p>
                <p className="text-gray-600">
                  📍 {card.comuna}, {card.ciudad}
                </p>
              </div>

              {card.bio && (
                <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                  {card.bio}
                </p>
              )}

              {card.hobbies && card.hobbies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {card.hobbies.slice(0, 6).map((hobby, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 space-y-2">
                {card.nivel_limpieza && (
                  <div>
                    <span className="text-sm text-gray-500">Limpieza:</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.nivel_limpieza! ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {card.nivel_ruido && (
                  <div>
                    <span className="text-sm text-gray-500">Nivel de ruido:</span>
                    <div className="flex gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.nivel_ruido! ? 'bg-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Owner Profile Modal */}
      {showOwnerModal && card.owner && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowOwnerModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
                  {card.owner.foto_perfil ? (
                    <img 
                      src={card.owner.foto_perfil} 
                      alt={card.owner.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{card.owner.genero === 'M' ? '👨' : card.owner.genero === 'F' ? '👩' : '👤'}</span>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{card.owner.nombre}</h2>
                  <p className="text-white/90">{card.owner.edad} años • {card.owner.genero === 'M' ? 'Masculino' : card.owner.genero === 'F' ? 'Femenino' : 'Otro'}</p>
                </div>
                <button
                  onClick={() => setShowOwnerModal(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Ocupación */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Ocupación</h3>
                <p className="text-gray-800">{card.owner.ocupacion}</p>
              </div>

              {/* Bio */}
              {card.owner.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Sobre mí</h3>
                  <p className="text-gray-800 italic">"{card.owner.bio}"</p>
                </div>
              )}

              {/* Estilo de vida */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Estilo de vida</h3>
                <div className="space-y-3">
                  {/* Limpieza */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">🧹 Nivel de limpieza</span>
                      <span className="text-sm font-semibold text-indigo-600">{card.owner.nivel_limpieza}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.owner.nivel_limpieza ? 'bg-indigo-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ruido */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700">🔊 Nivel de ruido</span>
                      <span className="text-sm font-semibold text-purple-600">{card.owner.nivel_ruido}/5</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded ${
                            i < card.owner.nivel_ruido ? 'bg-purple-500' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {card.owner.es_fumador && (
                      <span className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                        🚬 Fumador
                      </span>
                    )}
                    {card.owner.tiene_mascota && (
                      <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        🐾 Tiene mascotas
                      </span>
                    )}
                    {card.owner.horarios && (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        ⏰ {card.owner.horarios}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Hobbies */}
              {card.owner.hobbies && card.owner.hobbies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Hobbies e intereses</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.owner.hobbies.map((hobby, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm"
                      >
                        {hobby}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Personalidad */}
              {card.owner.personalidad && card.owner.personalidad.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Personalidad</h3>
                  <div className="flex flex-wrap gap-2">
                    {card.owner.personalidad.map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
