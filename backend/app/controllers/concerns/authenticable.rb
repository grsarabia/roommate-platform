# app/controllers/concerns/authenticable.rb
module Authenticable
  extend ActiveSupport::Concern

  included do
    before_action :authenticate_user!
  end

  private

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    
    if token.blank?
      return render_unauthorized
    end
    
    begin
      decoded = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256')
      @current_user = User.find(decoded[0]['user_id'])
    rescue JWT::DecodeError, JWT::ExpiredSignature
      return render_unauthorized('Token inválido o expirado')
    rescue ActiveRecord::RecordNotFound
      return render_unauthorized('Usuario no encontrado')
    end
  end

  def current_user
    @current_user
  end

  def render_unauthorized(message = 'No autorizado')
    render json: { error: message }, status: :unauthorized
  end
end
