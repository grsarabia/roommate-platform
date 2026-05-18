module Api
  module V1
    class ExpensesController < ApplicationController
      def index
        render json: { message: 'Expenses#index placeholder' }
      end
      def show
        render json: { message: 'Expenses#show placeholder' }
      end
    end
  end
end
