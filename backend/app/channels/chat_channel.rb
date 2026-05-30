# app/channels/chat_channel.rb
class ChatChannel < ApplicationCable::Channel
  # Cuando el usuario se suscribe al canal
  def subscribed
    match = Match.find_by(id: params[:match_id])
    
    # Verificar que el usuario tenga acceso a este match
    return reject unless match && match_belongs_to_user?(match)
    
    # Suscribirse al canal específico del match
    stream_for match
    
    Rails.logger.info "User #{current_user.id} subscribed to match #{match.id}"
  end

  # Cuando el usuario se desuscribe
  def unsubscribed
    Rails.logger.info "User #{current_user.id} unsubscribed from chat"
    stop_all_streams
  end

  # Acción para enviar un mensaje desde el cliente (opcional)
  # Podemos manejarlo directamente aquí en lugar de via HTTP
  def send_message(data)
    match = Match.find_by(id: params[:match_id])
    return unless match && match_belongs_to_user?(match)

    message = match.messages.build(
      content: data['content'],
      sender: current_user
    )

    if message.save
      # Broadcast del mensaje a todos los suscritos al canal
      broadcast_message(message)
    else
      # Enviar error de vuelta al cliente
      transmit(
        type: 'error',
        errors: message.errors.full_messages
      )
    end
  end

  # Acción para notificar que el usuario está escribiendo
  def typing(data)
    match = Match.find_by(id: params[:match_id])
    return unless match && match_belongs_to_user?(match)

    # Broadcast a los otros usuarios (no al que está escribiendo)
    ChatChannel.broadcast_to(
      match,
      type: 'user_typing',
      user: {
        id: current_user.id,
        nombre: current_user.nombre
      },
      is_typing: data['is_typing']
    )
  end

  # Marcar mensajes como leídos
  def mark_as_read(data)
    match = Match.find_by(id: params[:match_id])
    return unless match && match_belongs_to_user?(match)

    # Marcar todos los mensajes no leídos del otro usuario
    unread_count = match.messages
                        .unread
                        .where.not(sender_id: current_user.id)
                        .update_all(read_at: Time.current)

    # Notificar al otro usuario que sus mensajes fueron leídos
    ChatChannel.broadcast_to(
      match,
      type: 'messages_read',
      reader_id: current_user.id,
      count: unread_count
    )
  end

  private

  def match_belongs_to_user?(match)
    match.user_id == current_user.id || match.other_user(current_user)
  end

  def broadcast_message(message)
    ChatChannel.broadcast_to(
      message.match,
      type: 'new_message',
      message: {
        id: message.id,
        content: message.content,
        sender: {
          id: message.sender.id,
          nombre: message.sender.nombre,
          foto_perfil: message.sender.foto_perfil
        },
        is_mine: false, # El cliente determinará esto basado en sender_id
        read_at: message.read_at,
        created_at: message.created_at
      }
    )
  end
end
