class Api::V1::ListingsController < ApplicationController
  before_action :authorize_request, only: [:create, :update, :destroy]
  before_action :set_listing, only: [:show, :update, :destroy]

  def index
    render json: Listing.all
  end

  def show
    render json: Listing.find(params[:id])
  end

  def create
    listing = @current_user.listings.build(listing_params)
    if listing.save
      render json: listing, status: :created
    else
      render json: { errors: listing.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    @listing = Listing.find(params[:id])

    if @listing.update(listing_params)
      # 🔹 Manejo de fotos existentes
      if params[:existing_photos]
        # Mantener solo las fotos que quedaron
        @listing.photos.each do |photo|
          unless params[:existing_photos].include?(photo.blob.id.to_s)
            photo.purge # elimina la foto de ActiveStorage
          end
        end
      else
        # Si no mandaron existing_photos, eliminamos todas
        @listing.photos.purge
      end

      # 🔹 Agregar fotos nuevas
      if params[:listing][:photos]
        params[:listing][:photos].each do |photo|
          @listing.photos.attach(photo)
        end
      end

      render json: @listing
    else
      render json: @listing.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @listing.user == @current_user
      @listing.destroy
      head :no_content
    else
      render json: { errors: "No autorizado" }, status: :forbidden
    end
  end

  private

  def set_listing
    @listing = Listing.find(params[:id])
  end

  def listing_params
    params.require(:listing).permit(
      :title, :description, :price,
      :address_text, :comuna,
      :gastos_incluidos, :lat, :lng, photos: []
    )
  end
end
