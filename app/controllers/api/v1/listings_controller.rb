module Api
  module V1
    class ListingsController < ApplicationController
      def index
        render json: { message: 'Listings#index placeholder' }
      end
      def show
        render json: { message: 'Listings#show placeholder' }
      end
    end
  end
end
