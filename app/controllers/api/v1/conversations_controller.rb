module Api
  module V1
    class ConversationsController < ApplicationController
      def index
        render json: { message: 'Conversations#index placeholder' }
      end
      def show
        render json: { message: 'Conversations#show placeholder' }
      end
    end
  end
end
