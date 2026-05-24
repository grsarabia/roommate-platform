# app/serializers/photo_serializer.rb
class PhotoSerializer < ActiveModel::Serializer
  include Rails.application.routes.url_helpers

  attributes :id, :url

  def id
    object.blob.id
  end

  def url
    Rails.application.routes.url_helpers.url_for(object)
  end
end