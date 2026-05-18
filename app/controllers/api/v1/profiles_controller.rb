module Api
  module V1
    class ProfilesController < ApplicationController
      def show
        render json: { message: 'Profiles#show placeholder' }
      end
    end
  end
end
