class Listing < ApplicationRecord
  belongs_to :user
  has_many_attached :photos
  
  # Asociaciones de matching
  has_many :swipes, as: :target, dependent: :destroy
  has_many :matches, as: :matched, dependent: :destroy
  
  # Validaciones básicas
  validates :title, :description, :price, presence: true
  validates :price, numericality: { greater_than: 0 }
  
  # Validaciones de matching
  validates :edad_min, numericality: { greater_than: 17, allow_nil: true }
  validates :edad_max, numericality: { greater_than: 17, less_than: 100, allow_nil: true }
  validates :nivel_limpieza_minimo, numericality: { in: 1..5, allow_nil: true }
  validates :genero_requerido, inclusion: { in: %w[Cualquiera M F], allow_nil: true }
  validates :roommates_actuales, numericality: { greater_than_or_equal_to: 0, allow_nil: true }
  validates :total_roommates, numericality: { greater_than: 0, allow_nil: true }
  
  # Validación: roommates actuales no puede ser mayor que total
  validate :roommates_actuales_not_greater_than_total
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :with_photos, -> { joins(:photos_attachments) }
  scope :by_comuna, ->(comuna) { where('LOWER(comuna) = ?', comuna.downcase) if comuna.present? }
  scope :price_range, ->(min, max) { where(price: min..max) if min.present? && max.present? }
  
  # Métodos
  def tiene_requisitos_definidos?
    genero_requerido.present? || 
    edad_min.present? || 
    edad_max.present? || 
    nivel_limpieza_minimo.present?
  end
  
  def acepta_genero?(genero)
    genero_requerido.blank? || 
    genero_requerido == 'Cualquiera' || 
    genero_requerido == genero
  end
  
  def acepta_edad?(edad)
    return true if edad_min.blank? && edad_max.blank?
    return true if edad.blank?
    
    (edad_min.blank? || edad >= edad_min) && 
    (edad_max.blank? || edad <= edad_max)
  end
  
  def acepta_fumador?(es_fumador)
    !no_fumadores || !es_fumador
  end
  
  def acepta_mascota?(tiene_mascota)
    !no_mascotas || !tiene_mascota
  end
  
  def acepta_nivel_limpieza?(nivel)
    nivel_limpieza_minimo.blank? || 
    nivel.blank? || 
    nivel >= nivel_limpieza_minimo
  end
  
  private
  
  def roommates_actuales_not_greater_than_total
    if roommates_actuales.present? && total_roommates.present? && roommates_actuales > total_roommates
      errors.add(:roommates_actuales, "no puede ser mayor que el total de roommates")
    end
  end
end
