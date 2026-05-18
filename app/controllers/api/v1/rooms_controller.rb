module Api
  module V1
    class RoomsController < ApplicationController
      def index
        render json: { message: 'Rooms#index placeholder' }
      end
      def show
        render json: { message: 'Rooms#show placeholder' }
      end
    end
  end
end
