# app/controllers/messages_controller.rb
  include Authenticable

class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_match
  before_action :set_message, only: [:mark_as_read]

  # GET /matches/:match_id/messages
  # Listar mensajes de una conversación
  def index
    messages = @match.messages
                     .includes(:sender)
                     .chronological
                     .page(params[:page] || 1)
                     .per(50)
    
    # Marcar mensajes como leídos (los que no son del usuario actual)
    mark_conversation_as_read unless params[:skip_mark_read]
    
    render json: {
      messages: messages.map { |m| message_detail(m) },
      pagination: {
        current_page: messages.current_page,
        total_pages: messages.total_pages,
        total_count: messages.total_count
      }
    }
  end

  # POST /matches/:match_id/messages
  # Enviar un mensaje
  def create
    message = @match.messages.build(message_params.merge(sender: current_user))
    
    if message.save
      # Broadcast del mensaje vía WebSocket
      ChatChannel.broadcast_to(
        @match,
        type: 'new_message',
        message: message_detail(message)
      )
      
      # TODO: Enviar notificación push/email al receptor si está offline
      
      render json: {
        message: message_detail(message),
        notice: 'Mensaje enviado'
      }, status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /matches/:match_id/messages/:id/read
  # Marcar un mensaje como leído
  def mark_as_read
    if @message.sender?(current_user)
      return render json: { error: 'No puedes marcar tus propios mensajes como leídos' }, status: :unprocessable_entity
    end

    @message.mark_as_read!
    render json: { message: 'Mensaje marcado como leído' }
  end

  # PATCH /matches/:match_id/messages/read_all
  # Marcar todos los mensajes de la conversación como leídos
  def mark_all_as_read
    unread_messages = @match.messages
                            .unread
                            .where.not(sender_id: current_user.id)
    
    unread_messages.update_all(read_at: Time.current)
    
    render json: {
      message: 'Todos los mensajes marcados como leídos',
      count: unread_messages.count
    }
  end

  # GET /matches/:match_id/messages/unread_count
  # Cantidad de mensajes no leídos en esta conversación
  def unread_count
    count = @match.messages
                  .unread
                  .where.not(sender_id: current_user.id)
                  .count
    
    render json: { unread_count: count }
  end

  # GET /messages/unread_total
  # Total de mensajes no leídos en todas las conversaciones
  def unread_total
    matches = current_user.matches.active.pluck(:id)
    
    count = Message.where(match_id: matches)
                   .unread
                   .where.not(sender_id: current_user.id)
                   .count
    
    render json: { unread_total: count }
  end

  private

  def set_match
    @match = current_user.matches.find(params[:match_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Match no encontrado' }, status: :not_found
  end

  def set_message
    @message = @match.messages.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Mensaje no encontrado' }, status: :not_found
  end

  def message_params
    params.require(:message).permit(:content)
  end

  def message_detail(message)
    {
      id: message.id,
      content: message.content,
      sender: {
        id: message.sender.id,
        nombre: message.sender.nombre,
        foto_perfil: message.sender.foto_perfil
      },
      is_mine: message.sender_id == current_user.id,
      read_at: message.read_at,
      created_at: message.created_at
    }
  end

  def mark_conversation_as_read
    @match.messages
          .unread
          .where.not(sender_id: current_user.id)
          .update_all(read_at: Time.current)
  end


end
