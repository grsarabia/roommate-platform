# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      # Buscar token en el query string (?token=xxx) o en el header
      token = request.params[:token] || extract_token_from_header
      
      return reject_unauthorized_connection unless token

      begin
        payload = JWT.decode(token, Rails.application.credentials.secret_key_base, true, algorithm: 'HS256').first
        user = User.find_by(id: payload['user_id'])
        
        return reject_unauthorized_connection unless user
        
        user
      rescue JWT::DecodeError, JWT::ExpiredSignature
        reject_unauthorized_connection
      end
    end

    def extract_token_from_header
      # Extraer token del header Authorization si está disponible
      auth_header = request.headers['Authorization']
      auth_header.split(' ').last if auth_header&.start_with?('Bearer ')
    end
  end
end
