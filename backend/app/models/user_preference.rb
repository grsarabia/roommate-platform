class UserPreference < ApplicationRecord
  belongs_to :user
  
  # Validaciones
  validates :user_id, uniqueness: true
  validates :edad_min, numericality: { greater_than: 17, allow_nil: true }
  validates :edad_max, numericality: { greater_than: 17, less_than: 100, allow_nil: true }
  validates :precio_min, numericality: { greater_than: 0, allow_nil: true }
  validates :precio_max, numericality: { greater_than: 0, allow_nil: true }
  validates :nivel_limpieza_min, numericality: { in: 1..5, allow_nil: true }
  validates :genero_preferido, inclusion: { in: %w[Cualquiera M F], allow_nil: true }
  validates :horarios_compatibles, inclusion: { in: %w[Diurno Nocturno Mixto Flexible], allow_nil: true }
  
  # Validación: precio min no mayor que max
  validate :precio_min_not_greater_than_max
  validate :edad_min_not_greater_than_max
  
  # Métodos
  def precio_ok?(precio)
    return true if precio.blank?
    (precio_min.blank? || precio >= precio_min) && 
    (precio_max.blank? || precio <= precio_max)
  end
  
  def edad_ok?(edad)
    return true if edad.blank?
    (edad_min.blank? || edad >= edad_min) && 
    (edad_max.blank? || edad <= edad_max)
  end
  
  def comuna_ok?(comuna)
    return true if comunas_preferidas.blank?
    comunas_preferidas.map(&:downcase).include?(comuna.downcase)
  end
  
  private
  
  def precio_min_not_greater_than_max
    if precio_min.present? && precio_max.present? && precio_min > precio_max
      errors.add(:precio_min, "no puede ser mayor que precio máximo")
    end
  end
  
  def edad_min_not_greater_than_max
    if edad_min.present? && edad_max.present? && edad_min > edad_max
      errors.add(:edad_min, "no puede ser mayor que edad máxima")
    end
  end
end
