module Api
  module V1
    class AuthController < ApplicationController
      def login
        render json: { message: 'Auth#login placeholder' }
      end
      def register
        render json: { message: 'Auth#register placeholder' }
      end
    end
  end
end
