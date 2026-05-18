module Api
  module V1
    class UsersController < ApplicationController
      def index
        render json: { message: 'Users#index placeholder' }
      end
      def show
        render json: { message: 'Users#show placeholder' }
      end
    end
  end
end
