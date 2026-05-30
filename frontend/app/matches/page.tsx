'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Match {
  id: number;
  user_id: number;
  listing_id: number;
  compatibility_score: number;
  status: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: number;
  };
  unread_count: number;
  other_user?: {
    id: number;
    nombre: string;
    foto_perfil: string;
    edad: number;
    ocupacion: string;
  };
  listing?: {
    id: number;
    titulo: string;
    fotos: string[];
    precio: number;
    comuna: string;
  };
  created_at: string;
}

export default function MatchesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMatches();
  }, [user, router, filter]);

  const fetchMatches = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? `${process.env.NEXT_PUBLIC_API_URL}/matches`
        : `${process.env.NEXT_PUBLIC_API_URL}/matches?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
      } else {
        setError('Error al cargar matches');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const archiveMatch = async (matchId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchMatches(); // Recargar lista
      } else {
        alert('Error al archivar match');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit' });
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            {matches.length} conexión{matches.length !== 1 ? 'es' : ''} encontrada{matches.length !== 1 ? 's' : ''}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'active'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            💬 Activos
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📋 Todos
          </button>
          <button
            onClick={() => setFilter('archived')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'archived'
                ? 'bg-indigo-500 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            📦 Archivados
          </button>
        </div>

        {/* Matches List */}
        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Tu Dashboard está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              ¡Empieza a hacer swipe para crear conexiones!
            </p>
            <Link
              href="/swipe"
              className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
            >
              Ir a Swipe
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => {
              const otherUser = match.other_user;
              const listing = match.listing;
              const displayName = otherUser ? otherUser.nombre : listing?.titulo || 'Match';
              const displayImage = otherUser 
                ? otherUser.foto_perfil 
                : listing?.fotos?.[0] || '/placeholder.svg';
              const displaySubtitle = otherUser 
                ? `${otherUser.edad} años · ${otherUser.ocupacion}` 
                : listing 
                ? `$${listing.precio?.toLocaleString('es-CL')}/mes · ${listing.comuna}`
                : '';

              return (
                <div
                  key={match.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden"
                >
                  <div className="flex items-center p-4 gap-4">
                    {/* Avatar/Photo */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={displayImage}
                        alt={displayName}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {match.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {match.unread_count}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800 truncate">
                          {displayName}
                        </h3>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 text-xs font-semibold rounded-full">
                          {match.compatibility_score}% match
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {displaySubtitle}
                      </p>
                      {match.last_message ? (
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${
                            match.unread_count > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                          }`}>
                            {match.last_message.content}
                          </p>
                          <span className="text-xs text-gray-400 ml-2">
                            {formatDate(match.last_message.created_at)}
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          ¡Envía el primer mensaje!
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/matches/${match.id}/chat`}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md"
                      >
                        💬 Chat
                      </Link>
                      {match.status === 'active' && (
                        <button
                          onClick={() => archiveMatch(match.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                        >
                          📦
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
