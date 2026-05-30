class Message < ApplicationRecord
  belongs_to :match
  belongs_to :sender, class_name: 'User'
  
  # Validaciones
  validates :content, presence: true, length: { minimum: 1, maximum: 1000 }
  
  # Scopes
  scope :unread, -> { where(read_at: nil) }
  scope :read, -> { where.not(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }
  scope :chronological, -> { order(created_at: :asc) }
  
  # Callbacks
  after_create :mark_match_as_active
  after_create :sync_to_reciprocal_match
  after_create_commit :broadcast_to_matches
  
  # Métodos
  def read?
    read_at.present?
  end
  
  def unread?
    read_at.blank?
  end
  
  def mark_as_read!
    update(read_at: Time.current) if unread?
  end
  
  def sender?(user)
    sender_id == user.id
  end
  
  def receiver
    match.user_id == sender_id ? match.other_user : match.user
  end
  
  private
  
  def mark_match_as_active
    match.activate! unless match.active?
  end
  
  # Sincroniza el mensaje al match recíproco cuando ambos usuarios tienen matches entre sí
  def sync_to_reciprocal_match
    # Solo aplicar si el match es entre dos usuarios
    return unless match.matched_type == 'User'
    
    # Buscar el match recíproco
    reciprocal_match = Match.find_by(
      user_id: match.matched_id,
      matched_type: 'User',
      matched_id: match.user_id
    )
    
    return unless reciprocal_match
    
    # Verificar si ya existe este mensaje en el match recíproco (evitar duplicados infinitos)
    existing = Message.find_by(
      match_id: reciprocal_match.id,
      sender_id: sender_id,
      content: content,
      created_at: created_at
    )
    
    return if existing
    
    # Crear copia del mensaje en el match recíproco (sin callbacks para evitar loops)
    Message.insert(
      {
        match_id: reciprocal_match.id,
        sender_id: sender_id,
        content: content,
        read_at: read_at,
        created_at: created_at,
        updated_at: updated_at
      }
    )
  end
  
  # Hace broadcast del mensaje a ambos matches (el original y el recíproco)
  def broadcast_to_matches
    # Broadcast al match actual
    broadcast_to_match(match)
    
    # Si es un match User-to-User, también broadcast al match recíproco
    if match.matched_type == 'User'
      reciprocal_match = Match.find_by(
        user_id: match.matched_id,
        matched_type: 'User',
        matched_id: match.user_id
      )
      
      broadcast_to_match(reciprocal_match) if reciprocal_match
    end
  end
  
  def broadcast_to_match(target_match)
    return unless target_match
    
    ChatChannel.broadcast_to(
      target_match,
      type: 'new_message',
      message: {
        id: id,
        content: content,
        sender: {
          id: sender.id,
          nombre: sender.nombre,
          foto_perfil: sender.foto_perfil
        },
        is_mine: false,
        read_at: read_at,
        created_at: created_at
      }
    )
  end
end
