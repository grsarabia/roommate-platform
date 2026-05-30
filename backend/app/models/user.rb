class User < ApplicationRecord
  has_secure_password
  
  # Asociaciones
  has_many :listings, dependent: :destroy
  has_one :user_preference, dependent: :destroy
  has_many :swipes, dependent: :destroy
  has_many :matches, dependent: :destroy
  has_many :sent_messages, class_name: 'Message', foreign_key: 'sender_id', dependent: :destroy
  
  # Validaciones
  validates :email, presence: true, uniqueness: true
  validates :nombre, presence: true, if: :onboarding_completed?
  validates :edad, numericality: { greater_than: 17, less_than: 100, allow_nil: true }
  validates :genero, inclusion: { in: %w[M F Otro Prefiero\ no\ decir], allow_nil: true }
  validates :tipo_usuario, inclusion: { in: %w[demandante ofertante ambos], allow_nil: true }
  validates :nivel_limpieza, numericality: { in: 1..5, allow_nil: true }
  validates :nivel_ruido, numericality: { in: 1..5, allow_nil: true }
  
  # Scopes
  scope :demandantes, -> { where(tipo_usuario: ['demandante', 'ambos']) }
  scope :ofertantes, -> { where(tipo_usuario: ['ofertante', 'ambos']) }
  scope :onboarding_completed, -> { where(onboarding_completed: true) }
  scope :onboarding_pending, -> { where(onboarding_completed: [false, nil]) }
  
  # Métodos
  def profile_complete?
    nombre.present? && edad.present? && genero.present? && 
    tipo_usuario.present? && foto_perfil.present?
  end
  
  def es_demandante?
    tipo_usuario.in?(['demandante', 'ambos'])
  end
  
  def es_ofertante?
    tipo_usuario.in?(['ofertante', 'ambos'])
  end
  
  def swipe_on(target, direction)
    swipes.create!(
      target_id: target.id,
      target_type: target.class.name,
      direction: direction
    )
  end
  
  def already_swiped?(target)
    swipes.exists?(
      target_id: target.id,
      target_type: target.class.name
    )
  end
end