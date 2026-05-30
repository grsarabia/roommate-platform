class AuthController < ApplicationController
  def register
    user = User.new(user_params)
    if user.save
      token = encode_token(user.id)
      render json: { user: user, token: token }, status: :created
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def login
    user = User.find_by(email: params[:email])
    if user&.authenticate(params[:password])
      token = encode_token(user.id)
      render json: { user: user, token: token }, status: :ok
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  private

  def user_params
    params.permit(:email, :password, :password_confirmation)
  end

  def encode_token(user_id)
    payload = { user_id: user_id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, Rails.application.credentials.secret_key_base, 'HS256')
  end
end
