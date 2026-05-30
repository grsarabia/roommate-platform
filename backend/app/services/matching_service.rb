# app/services/matching_service.rb
class MatchingService
  # Calcula el score de compatibilidad entre un usuario y un listing (0-100)
  def calculate_compatibility(user, listing)
    return 0 unless user && listing
    return 0 unless passes_hard_requirements?(user, listing)
    
    score = 0
    
    # 1. Requisitos de género (15 puntos)
    score += gender_score(user, listing)
    
    # 2. Requisitos de edad (15 puntos)
    score += age_score(user, listing)
    
    # 3. Estilo de vida (30 puntos total)
    score += lifestyle_score(user, listing)
    
    # 4. Preferencias del usuario (20 puntos)
    score += user_preferences_score(user, listing)
    
    # 5. Precio (10 puntos)
    score += price_score(user, listing)
    
    # 6. Ubicación (10 puntos)
    score += location_score(user, listing)
    
    score.round
  end
  
  # Encuentra listings compatibles para un usuario
  def find_potential_matches(user, limit: 50)
    return [] unless user.es_demandante?
    return [] unless user.onboarding_completed?
    
    # Obtener listings activos que el usuario no ha visto
    already_swiped_ids = user.swipes.on_listings.pluck(:target_id)
    
    listings = Listing.where.not(id: already_swiped_ids)
                      .where.not(user_id: user.id) # No mostrar propias publicaciones
                      .includes(:user, :photos_attachments)
                      .limit(limit * 2) # Obtener más para filtrar
    
    # Calcular score para cada listing
    scored_listings = listings.map do |listing|
      score = calculate_compatibility(user, listing)
      next if score < 30 # Filtrar matches muy bajos
      
      { listing: listing, score: score }
    end.compact
    
    # Ordenar por score y retornar top matches
    scored_listings.sort_by { |item| -item[:score] }
                   .first(limit)
                   .map { |item| item[:listing] }
  end
  
  # Verifica si hay match mutuo
  def check_mutual_match(user, target)
    user_swipe = Swipe.find_by(
      user: user,
      target: target,
      direction: 'like'
    )
    
    return false unless user_swipe
    
    # Si target es listing, verificar swipe del dueño al usuario
    if target.is_a?(Listing)
      target_owner = target.user
      reverse_swipe = Swipe.find_by(
        user: target_owner,
        target: user,
        direction: 'like'
      )
    else
      # Si target es usuario, verificar swipe recíproco
      reverse_swipe = Swipe.find_by(
        user: target,
        target: user,
        direction: 'like'
      )
    end
    
    reverse_swipe.present?
  end
  
  # Encuentra demandantes que dieron like a los listings de un ofertante
  def find_potential_demandantes(ofertante, limit: 20)
    return [] unless ofertante.es_ofertante?
    return [] if ofertante.listings.empty?

    listing_ids = ofertante.listings.pluck(:id)

    # Demandantes que dieron like a algún listing del ofertante
    already_swiped_user_ids = ofertante.swipes.on_users.pluck(:target_id)

    demandante_ids = Swipe.likes
                          .where(target_type: 'Listing', target_id: listing_ids)
                          .where.not(user_id: already_swiped_user_ids)
                          .where.not(user_id: ofertante.id)
                          .pluck(:user_id)
                          .uniq
                          .first(limit)

    User.where(id: demandante_ids).includes(:user_preference)
  end
  
  # Requisitos eliminatorios
  def passes_hard_requirements?(user, listing)
    listing.acepta_genero?(user.genero) &&
    listing.acepta_edad?(user.edad) &&
    listing.acepta_fumador?(user.es_fumador) &&
    listing.acepta_mascota?(user.tiene_mascota)
  end
  
  # Score de género (15 puntos)
  def gender_score(user, listing)
    return 15 if listing.genero_requerido.blank? || listing.genero_requerido == 'Cualquiera'
    return 15 if listing.genero_requerido == user.genero
    0
  end
  
  # Score de edad (15 puntos)
  def age_score(user, listing)
    return 15 if listing.edad_min.blank? && listing.edad_max.blank?
    return 0 if user.edad.blank?
    
    # Si está exactamente en el rango perfecto
    if listing.acepta_edad?(user.edad)
      # Bonus si está en el centro del rango
      if listing.edad_min && listing.edad_max
        mid_point = (listing.edad_min + listing.edad_max) / 2.0
        distance_from_mid = (user.edad - mid_point).abs
        range_size = listing.edad_max - listing.edad_min
        
        # Más cerca del centro = mejor score
        proximity_score = 1 - (distance_from_mid / (range_size / 2.0))
        (15 * proximity_score).round
      else
        15
      end
    else
      0
    end
  end
  
  # Score de estilo de vida (30 puntos total)
  def lifestyle_score(user, listing)
    score = 0
    
    # Limpieza (10 puntos)
    if user.nivel_limpieza && listing.nivel_limpieza_minimo
      if user.nivel_limpieza >= listing.nivel_limpieza_minimo
        excess = user.nivel_limpieza - listing.nivel_limpieza_minimo
        score += [10 - excess, 10].min # Perfecto match = 10, exceso reduce score
      end
    else
      score += 7 # Neutral si no hay data
    end
    
    # Horarios (10 puntos)
    if user.horarios && listing.user&.horarios
      if user.horarios == listing.user.horarios
        score += 10
      elsif user.horarios == 'Mixto' || listing.user.horarios == 'Mixto'
        score += 7 # Mixto es compatible con todo
      else
        score += 3 # Horarios diferentes pero no eliminatorio
      end
    else
      score += 6 # Neutral
    end
    
    # Nivel de ruido (10 puntos)
    if user.nivel_ruido && listing.user&.nivel_ruido
      difference = (user.nivel_ruido - listing.user.nivel_ruido).abs
      score += [10 - (difference * 2), 0].max
    else
      score += 6 # Neutral
    end
    
    score
  end
  
  # Score de preferencias del usuario (20 puntos)
  def user_preferences_score(user, listing)
    return 10 unless user.user_preference # Neutral si no hay preferencias
    
    prefs = user.user_preference
    score = 0
    
    # Comuna (10 puntos)
    if prefs.comunas_preferidas.present?
      if prefs.comuna_ok?(listing.comuna)
        score += 10
      else
        score += 2 # Fuera de preferencias pero no elimina
      end
    else
      score += 7 # Sin preferencia = neutral positivo
    end
    
    # Características del espacio (10 puntos)
    if listing.caracteristicas
      desired_features = ['internet_incluido', 'amoblado', 'lavadora']
      available_features = listing.caracteristicas.select { |k, v| v == true }.keys
      matching_features = desired_features & available_features
      score += (matching_features.size * 3.3).round # Max 10 puntos
    else
      score += 5 # Neutral
    end
    
    score
  end
  
  # Score de precio (10 puntos)
  def price_score(user, listing)
    return 7 unless user.user_preference&.precio_max # Neutral si no hay limite
    
    prefs = user.user_preference
    
    if prefs.precio_ok?(listing.price)
      # Dentro del rango - mejor score si está más abajo
      if prefs.precio_max
        percentage_of_max = (listing.price.to_f / prefs.precio_max.to_f)
        score = (10 * (1 - percentage_of_max * 0.5)).round # 50-100% del max = 5-10 puntos
        [score, 10].min
      else
        10
      end
    else
      0 # Fuera del presupuesto
    end
  end
  
  # Score de ubicación (10 puntos)
  def location_score(user, listing)
    return 7 unless user.user_preference&.comunas_preferidas&.any?
    
    prefs = user.user_preference
    
    if prefs.comuna_ok?(listing.comuna)
      10
    else
      # Fuera de preferencias pero no elimina
      3
    end
  end
end
