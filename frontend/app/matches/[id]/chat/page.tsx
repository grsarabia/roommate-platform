'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useActionCable } from '@/hooks/useActionCable';

interface Message {
  id: number;
  match_id?: number;
  sender_id?: number;
  sender?: {
    id: number;
    nombre: string;
    foto_perfil: string;
  };
  content: string;
  read_at: string | null;
  created_at: string;
  is_mine?: boolean;
}

interface Match {
  id: number;
  compatibility_score: number;
  other_user?: {
    id: number;
    nombre: string;
    foto_perfil: string;
  };
  listing?: {
    id: number;
    titulo: string;
    fotos: string[];
  };
}

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const matchId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { user } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // WebSocket connection
  const { connected, sendMessage: sendWsMessage, sendTyping, markAsRead } = useActionCable({
    channel: 'ChatChannel',
    room: matchId,
    onReceived: (data) => {
      console.log('WebSocket data received:', data);
      
      if (data.type === 'new_message' && data.message) {
        // Add new message to the list
        setMessages(prev => {
          // Evitar duplicados
          if (prev.some(m => m.id === data.message.id)) {
            return prev;
          }
          return [...prev, data.message];
        });
      } else if (data.type === 'user_typing') {
        // Show/hide typing indicator
        if (data.user?.id !== user?.id) {
          setOtherUserTyping(data.is_typing || false);
          if (data.is_typing) {
            setTimeout(() => setOtherUserTyping(false), 3000);
          }
        }
      } else if (data.type === 'messages_read') {
        // Update read status
        if (data.reader_id !== user?.id) {
          setMessages(prev => 
            prev.map(msg => 
              msg.sender_id === user?.id ? { ...msg, read_at: new Date().toISOString() } : msg
            )
          );
        }
      }
    },
    onConnected: () => {
      console.log('✅ Connected to chat');
      // Marcar mensajes como leídos al conectar
      markAsRead();
    },
    onDisconnected: () => {
      console.log('❌ Disconnected from chat');
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchMatch();
    fetchMessages();

    // NO MÁS POLLING - El WebSocket manejará las actualizaciones en tiempo real
  }, [user, router, matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMatch = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMatch(data.match);
      } else {
        setError('Match no encontrado');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;

    setSending(true);
    
    try {
      // Enviar por WebSocket directamente (más rápido)
      if (connected) {
        sendWsMessage(newMessage.trim());
        setNewMessage('');
      } else {
        // Fallback a HTTP si WebSocket no está conectado
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matches/${matchId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: {
              content: newMessage.trim(),
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Agregar el mensaje a la lista manualmente ya que no hay WebSocket
          if (data.message) {
            setMessages(prev => [...prev, data.message]);
          }
          setNewMessage('');
        } else {
          const error = await response.json();
          console.error('Error response:', error);
          alert(error.error || error.errors?.join(', ') || 'Error al enviar mensaje');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    // Enviar indicador de "escribiendo..." via WebSocket
    if (connected && value.trim().length > 0) {
      if (!isTyping) {
        setIsTyping(true);
        sendTyping(true);
      }
      
      // Reset timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing después de 2 segundos de inactividad
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(false);
      }, 2000);
    } else if (isTyping) {
      setIsTyping(false);
      sendTyping(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' });
    }
  };

  const groupMessagesByDate = () => {
    const groups: { [key: string]: Message[] } = {};
    messages.forEach(msg => {
      const date = new Date(msg.created_at).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {error || 'Match no encontrado'}
          </h2>
          <button
            onClick={() => router.push('/matches')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            Volver a Matches
          </button>
        </div>
      </div>
    );
  }

  const otherUser = match.other_user;
  const listing = match.listing;
  const displayName = otherUser ? otherUser.nombre : listing?.titulo || 'Match';
  const displayImage = otherUser ? otherUser.foto_perfil : listing?.fotos?.[0] || '/placeholder.svg';
  const messageGroups = groupMessagesByDate();

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-md px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/matches')}
          className="text-indigo-600 hover:text-indigo-700 font-bold text-xl"
        >
          ←
        </button>
        <img
          src={displayImage}
          alt={displayName}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        <div className="flex-1">
          <h2 className="font-bold text-gray-800">{displayName}</h2>
          <p className="text-xs text-indigo-600">
            {match.compatibility_score}% match
          </p>
        </div>
        {/* Connection status indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} title={connected ? 'Conectado' : 'Desconectado'}></div>
          <span className="text-xs text-gray-500">{connected ? 'En línea' : 'Offline'}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {Object.keys(messageGroups).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-gray-500">No hay mensajes aún</p>
            <p className="text-gray-400 text-sm mt-2">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 bg-gray-300 rounded-full text-xs text-gray-700">
                  {formatDate(msgs[0].created_at)}
                </div>
              </div>

              {/* Messages */}
              {msgs.map((message) => {
                const isMine = (message.sender_id || message.sender?.id) === user.id;
                return (
                  <div
                    key={message.id}
                    className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                            : 'bg-white text-gray-800 shadow-sm'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                      <div className={`text-xs text-gray-400 mt-1 ${isMine ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.created_at)}
                        {isMine && message.read_at && ' · ✓✓'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[70%]">
              <div className="px-4 py-2 rounded-2xl bg-gray-200 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t px-4 py-3 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? '...' : '➤'}
        </button>
      </form>
    </div>
  );
}
