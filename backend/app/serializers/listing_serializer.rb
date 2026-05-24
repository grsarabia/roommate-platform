class ListingSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :price, :address_text, :comuna, :gastos_incluidos, :created_at, :updated_at
  has_many :photos, serializer: PhotoSerializer
  belongs_to :user
end