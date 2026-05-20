Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show]
      resource :profile, only: [:show]
      resources :listings, only: [:index, :show]
      resources :rooms, only: [:index, :show]
      resources :conversations, only: [:index, :show]
      resources :messages, only: [:index, :show]
      resources :expenses, only: [:index, :show]

      # Authentication
      post 'auth/login', to: 'auth#login'
      post 'auth/register', to: 'auth#register'
    end
  end

  # You can add other routes below as needed
end