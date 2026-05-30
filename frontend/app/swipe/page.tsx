'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import SwipeCard from '@/components/SwipeCard';

interface Card {
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
}

export default function SwipePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noMoreCards, setNoMoreCards] = useState(false);
  const [viewedListings, setViewedListings] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchNextCard();
  }, [user, router]);

  // Registrar vista cuando se muestra un listing (solo una vez por sesión)
  useEffect(() => {
    if (cards.length > 0 && cards[0].type === 'listing') {
      const listingId = cards[0].id;
      
      // Solo incrementar si no lo hemos visto antes en esta sesión
      if (!viewedListings.has(listingId)) {
        const token = localStorage.getItem('token');
        
        // Marcar como visto primero
        setViewedListings(prev => new Set(prev).add(listingId));
        
        // Incrementar vista (fire and forget)
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/increment_view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }).catch(err => console.error('Error registrando vista:', err));
      }
    }
  }, [cards, viewedListings]);

  const fetchNextCard = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/swipes/potential`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.cards && data.cards.length > 0) {
          // Transformar las cards del backend al formato del frontend
          const transformed: Card[] = data.cards.map((item: any) => {
            const cardData = item.data || item;
            return {
              id: item.id,
              type: item.type === 'User' ? 'user' : 'listing',
              compatibility_score: item.compatibility_score,
              // Campos de usuario
              nombre: cardData.nombre,
              edad: cardData.edad,
              genero: cardData.genero,
              ocupacion: cardData.ocupacion,
              bio: cardData.bio,
              foto_perfil: cardData.foto_perfil,
              hobbies: cardData.hobbies,
              nivel_limpieza: cardData.nivel_limpieza,
              nivel_ruido: cardData.nivel_ruido,
              // Campos de listing
              titulo: cardData.title || cardData.titulo,
              precio: cardData.price || cardData.precio,
              comuna: cardData.comuna,
              ciudad: cardData.ciudad,
              direccion: cardData.address_text || cardData.direccion,
              fotos: cardData.photos?.map((p: any) => p.url || p) || cardData.fotos || [],
              // Información del dueño (para listings)
              owner: cardData.owner || undefined,
            };
          });
          setCards(transformed);
          setNoMoreCards(false);
        } else {
          setNoMoreCards(true);
          setCards([]);
        }
      } else if (response.status === 404) {
        setNoMoreCards(true);
        setCards([]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error al cargar cards');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (cards.length === 0) return;

    const currentCard = cards[0];
    const swipeDirection = direction === 'right' ? 'like' : 'dislike';

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/swipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          target_id: currentCard.id,
          target_type: currentCard.type === 'user' ? 'User' : 'Listing',
          direction: swipeDirection,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Si hay match, mostrar notificación
        if (data.is_match) {
          showMatchNotification(currentCard);
        }

        // Remover la card swiped y cargar más si quedan pocas
        const remaining = cards.slice(1);
        setCards(remaining);
        if (remaining.length < 2) {
          setTimeout(() => fetchNextCard(), 300);
        }
      } else {
        setError('Error al registrar swipe');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    }
  };

  const showMatchNotification = (card: Card) => {
    // Mostrar notificación de match (puedes mejorar esto con un modal)
    const name = card.type === 'user' ? card.nombre : card.titulo;
    alert(`🎉 ¡Es un match con ${name}! Revisa tus matches para empezar a chatear.`);
  };

  const handleLike = () => handleSwipe('right');
  const handleDislike = () => handleSwipe('left');

  if (!user) return null;

  if (loading && cards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Descubre tu espacio ideal
          </h1>
          <p className="text-gray-600 mt-2">
            Desliza a la derecha si te interesa, a la izquierda si no
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Card Stack */}
        <div className="relative" style={{ height: '600px' }}>
          {noMoreCards ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  No hay más cards por ahora
                </h2>
                <p className="text-gray-600 mb-4">
                  Revisa más tarde para ver nuevos perfiles y publicaciones
                </p>
                <button
                  onClick={() => router.push('/matches')}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                >
                  Ver mis matches
                </button>
              </div>
            </div>
          ) : cards.length > 0 ? (
            <>
              <SwipeCard
                key={cards[0].id}
                card={cards[0]}
                onSwipe={handleSwipe}
              />
            </>
          ) : null}
        </div>

        {/* Action Buttons */}
        {cards.length > 0 && !noMoreCards && (
          <div className="flex justify-center items-end gap-4 mt-8">
            <button
              onClick={handleDislike}
              className="flex flex-col items-center gap-2 group"
              aria-label="No me gusta"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-xl flex items-center justify-center text-3xl hover:scale-110 transition-transform hover:shadow-2xl">
                <span className="text-white font-bold">✕</span>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-red-500">
                No me gusta
              </span>
            </button>

            <button
              onClick={() => router.push('/matches')}
              className="flex flex-col items-center gap-2 group"
              aria-label="Ver dashboard"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full shadow-lg flex items-center justify-center text-xl hover:scale-110 transition-transform">
                <span className="text-white">📊</span>
              </div>
              <span className="text-xs font-medium text-gray-500 group-hover:text-indigo-600">
                Dashboard
              </span>
            </button>

            <button
              onClick={handleLike}
              className="flex flex-col items-center gap-2 group"
              aria-label="Me gusta"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full shadow-xl flex items-center justify-center text-3xl hover:scale-110 transition-transform hover:shadow-2xl">
                <span className="text-white font-bold">✓</span>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-green-500">
                Me gusta
              </span>
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>💡 Desliza la card o usa los botones</p>
        </div>
      </div>
    </div>
  );
}
