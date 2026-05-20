module Api
  module V1
    module Auth
      class AuthController < ApplicationController
        def register
          user = User.new(user_params)

          if user.save
            token = ::Auth::JwtService.encode(user_id: user.id)

            render json: {
              token: token,
              user: UserSerializer.new(user)
            }, status: :created
          else
            render json: {
              errors: user.errors.full_messages
            }, status: :unprocessable_entity
          end
        end

        def login
          user = User.find_by(email: params[:email])

          if user&.authenticate(params[:password])
            token = ::Auth::JwtService.encode(user_id: user.id)

            render json: {
              token: token,
              user: UserSerializer.new(user)
            }
          else
            render json: {
              error: 'Invalid credentials'
            }, status: :unauthorized
          end
        end

        def me
          header = request.headers['Authorization']

          token = header.split(' ').last
          decoded = ::Auth::JwtService.decode(token)

          user = User.find(decoded[:user_id])

          render json: UserSerializer.new(user)
        rescue
          render json: { error: 'Unauthorized' }, status: :unauthorized
        end

        private

        def user_params
          params.require(:user).permit(
            :email,
            :password,
            :password_confirmation
          )
        end
      end
    end
  end
end
