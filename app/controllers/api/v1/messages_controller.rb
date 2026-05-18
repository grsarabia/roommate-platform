module Api
  module V1
    class MessagesController < ApplicationController
      def index
        render json: { message: 'Messages#index placeholder' }
      end
      def show
        render json: { message: 'Messages#show placeholder' }
      end
    end
  end
end
