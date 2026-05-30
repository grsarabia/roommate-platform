class Swipe < ApplicationRecord
  belongs_to :user
  belongs_to :target, polymorphic: true
  
  # Validaciones
  validates :user_id, uniqueness: { scope: [:target_id, :target_type] }
  validates :direction, presence: true, inclusion: { in: %w[like dislike] }
  validates :target_id, :target_type, presence: true
  
  # Scopes
  scope :likes, -> { where(direction: 'like') }
  scope :dislikes, -> { where(direction: 'dislike') }
  scope :on_users, -> { where(target_type: 'User') }
  scope :on_listings, -> { where(target_type: 'Listing') }
  scope :recent, -> { order(created_at: :desc) }
  
  # Callbacks
  after_create :check_for_mutual_like
  
  # Métodos
  def like?
    direction == 'like'
  end
  
  def dislike?
    direction == 'dislike'
  end
  
  private
  
  def check_for_mutual_like
    return unless like?
    
    # Si es un swipe a un listing
    if target_type == 'Listing'
      # Verificar si el dueño del listing también dio like a este usuario
      listing_owner = target.user
      mutual_swipe = Swipe.find_by(
        user: listing_owner,
        target: user,
        direction: 'like'
      )
      
      if mutual_swipe
        create_match_if_not_exists(listing_owner, target)
      end
    end
    
    # Si es un swipe a un usuario (ofertante dando like a un demandante)
    if target_type == 'User'
      # Verificar si el target (demandante) dio like a algún listing del swiper (ofertante)
      swiper_listing_ids = user.listings.pluck(:id)

      mutual_swipe = Swipe.likes
                          .where(user_id: target.id, target_type: 'Listing', target_id: swiper_listing_ids)
                          .first

      if mutual_swipe
        listing = mutual_swipe.target
        # El demandante (target) matchea con el listing
        # El ofertante (user) matchea con el demandante (target)
        create_match_for_listing_and_users(target, user, listing)
      end
    end
  end
  
  # Crear matches bidireccionales entre demandante, ofertante y listing
  def create_match_for_listing_and_users(demandante, ofertante, listing)
    compatibility_score = MatchingService.new.calculate_compatibility(demandante, listing)
    
    # Match 1: Demandante ↔ Listing
    unless Match.exists?(user: demandante, matched: listing)
      Match.create!(
        user: demandante,
        matched: listing,
        compatibility_score: compatibility_score
      )
    end
    
    # Match 2: Demandante ↔ Ofertante
    unless Match.exists?(user: demandante, matched: ofertante)
      Match.create!(
        user: demandante,
        matched: ofertante,
        compatibility_score: compatibility_score
      )
    end
    
    # Match 3: Ofertante ↔ Demandante
    unless Match.exists?(user: ofertante, matched: demandante)
      Match.create!(
        user: ofertante,
        matched: demandante,
        compatibility_score: compatibility_score
      )
    end
  end
  
  def create_match_if_not_exists(other_user, listing)
    # Determinar el objeto matched correcto para cada usuario
    # Si hay listing:
    #   - usuario actual (demandante) matchea con el listing
    #   - otro usuario (ofertante/dueño) matchea con el usuario actual
    # Si no hay listing (User-to-User):
    #   - usuario actual matchea con el otro usuario
    #   - otro usuario matchea con el usuario actual
    
    matched_for_current = listing || other_user
    matched_for_other = user  # El otro usuario siempre matchea con el usuario actual
    
    # Evitar duplicados - verificar en ambas direcciones
    return if Match.exists?(user: user, matched: matched_for_current) || 
              Match.exists?(user: other_user, matched: matched_for_other)
    
    # Calcular compatibilidad
    compatibility_score = if listing
      MatchingService.new.calculate_compatibility(user, listing)
    else
      50 # Score por defecto para matches User-to-User
    end
    
    # Crear match para el usuario actual
    Match.create!(
      user: user,
      matched: matched_for_current,
      compatibility_score: compatibility_score
    )
    
    # Crear match recíproco para el otro usuario
    Match.create!(
      user: other_user,
      matched: matched_for_other,
      compatibility_score: compatibility_score
    )
  end
end
