# app/controllers/swipes_controller.rb
class SwipesController < ApplicationController
  include Authenticable
  before_action :authenticate_user!

  # POST /swipes
  # Crear un swipe (like o dislike)
  def create
    target = find_target
    
    if current_user.already_swiped?(target)
      return render json: { error: 'Ya hiciste swipe en este elemento' }, status: :unprocessable_entity
    end

    swipe = current_user.swipe_on(target, swipe_params[:direction])
    
    if swipe.persisted?
      # Verificar si hubo match
      is_match = MatchingService.new.check_mutual_match(current_user, target)
      
      render json: {
        swipe: swipe,
        is_match: is_match,
        message: is_match ? '¡Es un match! 🎉' : 'Swipe registrado'
      }, status: :created
    else
      render json: { errors: swipe.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # GET /swipes/potential
  # Obtener el siguiente perfil/listing para hacer swipe
  def potential
    service = MatchingService.new
    
    if current_user.es_demandante?
      # Demandantes ven listings
      listings = service.find_potential_matches(current_user, limit: 20)
      
      if listings.any?
        # Calcular scores para cada uno
        cards = listings.map do |listing|
          {
            id: listing.id,
            type: 'Listing',
            data: ListingSerializer.new(listing),
            compatibility_score: service.calculate_compatibility(current_user, listing)
          }
        end
        
        render json: { cards: cards, count: cards.size }
      else
        render json: { cards: [], message: 'No hay más perfiles disponibles por ahora' }
      end
    elsif current_user.es_ofertante?
      # Ofertantes ven demandantes que dieron like a sus listings
      demandantes = service.find_potential_demandantes(current_user, limit: 20)

      if demandantes.any?
        cards = demandantes.map do |demandante|
          liked_listing = current_user.listings
                                      .joins("INNER JOIN swipes ON swipes.target_id = listings.id AND swipes.target_type = 'Listing'")
                                      .where(swipes: { user_id: demandante.id, direction: 'like' })
                                      .first

          {
            id: demandante.id,
            type: 'User',
            data: {
              nombre: demandante.nombre,
              edad: demandante.edad,
              genero: demandante.genero,
              ocupacion: demandante.ocupacion,
              bio: demandante.bio,
              foto_perfil: demandante.foto_perfil,
              nivel_limpieza: demandante.nivel_limpieza,
              nivel_ruido: demandante.nivel_ruido,
              horarios: demandante.horarios,
              tiene_mascota: demandante.tiene_mascota,
              es_fumador: demandante.es_fumador,
              hobbies: demandante.hobbies
            },
            liked_listing: liked_listing ? {
              id: liked_listing.id,
              title: liked_listing.title,
              price: liked_listing.price,
              comuna: liked_listing.comuna
            } : nil,
            compatibility_score: liked_listing ? service.calculate_compatibility(demandante, liked_listing) : 0
          }
        end

        render json: { cards: cards, count: cards.size }
      else
        render json: { cards: [], message: 'No hay demandantes interesados en tus publicaciones aún' }
      end
    else
      render json: { error: 'Completa tu perfil para ver matches' }, status: :unprocessable_entity
    end
  end

  # GET /swipes/history
  # Historial de swipes del usuario
  def history
    swipes = current_user.swipes
                        .includes(:target)
                        .recent
                        .limit(100)
    
    render json: {
      swipes: swipes.map { |s| swipe_summary(s) }
    }
  end

  private

  def swipe_params
    if params[:swipe].present?
      params.require(:swipe).permit(:target_id, :target_type, :direction)
    else
      params.permit(:target_id, :target_type, :direction)
    end
  end

  def find_target
    target_class = swipe_params[:target_type].constantize
    target_class.find(swipe_params[:target_id])
  rescue NameError
    raise ActionController::BadRequest, 'Tipo de target inválido'
  rescue ActiveRecord::RecordNotFound
    raise ActionController::NotFound, 'Target no encontrado'
  end

  def swipe_summary(swipe)
    {
      id: swipe.id,
      direction: swipe.direction,
      target_type: swipe.target_type,
      target_id: swipe.target_id,
      created_at: swipe.created_at
    }
  end
end
