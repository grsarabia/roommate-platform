# app/controllers/matches_controller.rb
  include Authenticable

class MatchesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_match, only: [:show, :archive, :block, :activate]

  # GET /matches
  # Listar todos los matches del usuario
  def index
    page = (params[:page] || 1).to_i
    per_page = 20
    offset = (page - 1) * per_page

    base_query = current_user.matches.includes(:matched, :messages)
    base_query = base_query.send(filter_scope) if filter_scope
    
    matches = base_query.recent.limit(per_page).offset(offset)

    count_query = current_user.matches
    count_query = count_query.send(filter_scope) if filter_scope
    total_count = count_query.count

    render json: {
      matches: matches.map { |m| match_summary(m) },
      pagination: {
        current_page: page,
        total_pages: (total_count.to_f / per_page).ceil,
        total_count: total_count
      }
    }
  end

  # GET /matches/:id
  # Detalles completos de un match
  def show
    render json: {
      match: match_detail(@match),
      other_user: user_profile(@match.other_user),
      listing: @match.listing ? ListingSerializer.new(@match.listing) : nil,
      messages_preview: @match.messages.recent.limit(5).map { |m| message_summary(m) }
    }
  end

  # PATCH /matches/:id/archive
  # Archivar un match
  def archive
    if @match.archive!
      render json: { message: 'Match archivado', match: match_summary(@match) }
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /matches/:id/block
  # Bloquear un match
  def block
    if @match.block!
      render json: { message: 'Match bloqueado', match: match_summary(@match) }
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # PATCH /matches/:id/activate
  # Reactivar un match archivado
  def activate
    if @match.activate!
      render json: { message: 'Match reactivado', match: match_summary(@match) }
    else
      render json: { errors: @match.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /matches/stats
  # Estadísticas de matches del usuario
  def stats
    render json: {
      total_matches: current_user.matches.count,
      active_matches: current_user.matches.active.count,
      archived_matches: current_user.matches.archived.count,
      matches_with_messages: current_user.matches.joins(:messages).distinct.count,
      matches_with_unread: current_user.matches.with_unread_messages.count,
      total_swipes: current_user.swipes.count,
      likes_given: current_user.swipes.likes.count,
      match_rate: match_rate
    }
  end

  private

  def set_match
    @match = current_user.matches.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: 'Match no encontrado' }, status: :not_found
  end

  def filter_scope
    case params[:status] || params[:filter]
    when 'archived'
      :archived
    when 'blocked'
      :blocked
    when 'all'
      nil
    else
      :active # Default
    end
  end

  def match_summary(match)
    {
      id: match.id,
      compatibility_score: match.compatibility_score,
      status: match.status,
      created_at: match.created_at,
      other_user: {
        id: match.other_user&.id,
        nombre: match.other_user&.nombre,
        foto_perfil: match.other_user&.foto_perfil
      },
      listing: match.listing ? {
        id: match.listing.id,
        title: match.listing.title,
        price: match.listing.price,
        comuna: match.listing.comuna
      } : nil,
      last_message: match.last_message ? {
        content: match.last_message.content,
        created_at: match.last_message.created_at,
        sender_id: match.last_message.sender_id
      } : nil,
      unread_count: match.unread_count(current_user)
    }
  end

  def match_detail(match)
    {
      id: match.id,
      compatibility_score: match.compatibility_score,
      status: match.status,
      created_at: match.created_at,
      matched_type: match.matched_type,
      matched_id: match.matched_id
    }
  end

  def user_profile(user)
    return nil unless user
    
    {
      id: user.id,
      nombre: user.nombre,
      edad: user.edad,
      genero: user.genero,
      bio: user.bio,
      foto_perfil: user.foto_perfil,
      profesion: user.profesion,
      ocupacion: user.ocupacion,
      hobbies: user.hobbies,
      personalidad: user.personalidad,
      nivel_limpieza: user.nivel_limpieza,
      nivel_ruido: user.nivel_ruido,
      horarios: user.horarios,
      tiene_mascota: user.tiene_mascota,
      es_fumador: user.es_fumador
    }
  end

  def message_summary(message)
    {
      id: message.id,
      content: message.content,
      sender_id: message.sender_id,
      read_at: message.read_at,
      created_at: message.created_at
    }
  end

  def match_rate
    total_likes = current_user.swipes.likes.count
    return 0 if total_likes.zero?
    
    total_matches = current_user.matches.count
    ((total_matches.to_f / total_likes) * 100).round(2)
  end


end
