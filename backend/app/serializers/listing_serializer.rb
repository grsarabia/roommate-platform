class ListingSerializer < ActiveModel::Serializer
  attributes :id, :user_id, :title, :description, :price, :address_text, :comuna, :gastos_incluidos, :lat, :lng, :views_count, :created_at, :updated_at

  has_many :photos, serializer: PhotoSerializer
  
  belongs_to :user
  
  # Información del dueño/ofertante
  attribute :owner do
    {
      id: object.user.id,
      nombre: object.user.nombre,
      edad: object.user.edad,
      genero: object.user.genero,
      foto_perfil: object.user.foto_perfil,
      bio: object.user.bio,
      ocupacion: object.user.ocupacion,
      nivel_limpieza: object.user.nivel_limpieza,
      nivel_ruido: object.user.nivel_ruido,
      horarios: object.user.horarios,
      tiene_mascota: object.user.tiene_mascota,
      es_fumador: object.user.es_fumador,
      hobbies: object.user.hobbies,
      personalidad: object.user.personalidad
    }
  end
end