module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      rescue_from JWT::DecodeError do
        render json: { error: 'Invalid token' }, status: :unauthorized
      end

      private

      def authenticate_user!
        header = request.headers['Authorization']

        if header.present?
          token = header.split(' ').last
          decoded = Auth::JwtService.decode(token)

          @current_user = User.find(decoded[:user_id])
        else
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end
      rescue ActiveRecord::RecordNotFound
        render json: { error: 'User not found' }, status: :unauthorized
      end

      def current_user
        @current_user
      end
    end
  end
end
