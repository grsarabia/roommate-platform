class Api::V1::UsersController < ApplicationController
  before_action :authorize_request

  def profile
    render json: { user: @current_user }, status: :ok
  end

  private

  def authorize_request
    header = request.headers['Authorization']
    token = header.split(' ').last if header
    begin
      decoded = JWT.decode(token, ENV['JWT_SECRET'], true, algorithm: 'HS256')
      @current_user = User.find(decoded[0]['user_id'])
    rescue ActiveRecord::RecordNotFound => e
      render json: { errors: e.message }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { errors: e.message }, status: :unauthorized
    end
  end
end
