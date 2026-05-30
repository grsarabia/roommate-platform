Rails.application.routes.draw do
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Mount Action Cable WebSocket endpoint
  mount ActionCable.server => '/cable'

  # Auth routes (con y sin namespace para compatibilidad)
  post 'register', to: 'auth#register'
  post 'login', to: 'auth#login'
  get 'profile', to: 'users#profile'
  put 'profile', to: 'users#update'

  # Listings
  resources :listings, only: [:index, :show, :create, :update, :destroy] do
    member do
      post :increment_view  # POST /listings/:id/increment_view
    end
  end

  # Matching system routes
  resources :swipes, only: [:create] do
    collection do
      get :potential    # GET /swipes/potential - Obtener siguiente card
      get :history      # GET /swipes/history - Historial de swipes
    end
  end

  resources :matches, only: [:index, :show] do
    member do
      patch :archive    # PATCH /matches/:id/archive
      patch :block      # PATCH /matches/:id/block
      patch :activate   # PATCH /matches/:id/activate
    end
    collection do
      get :stats        # GET /matches/stats
    end
    
    # Messages nested under matches
    resources :messages, only: [:index, :create] do
      member do
        patch :mark_as_read   # PATCH /matches/:match_id/messages/:id/read
      end
      collection do
        patch :mark_all_as_read  # PATCH /matches/:match_id/messages/read_all
        get :unread_count        # GET /matches/:match_id/messages/unread_count
      end
    end
  end

  # Global message stats
  get 'messages/unread_total', to: 'messages#unread_total'

  # Namespace /api/v1 para compatibilidad con frontend existente
  namespace :api do
    namespace :v1 do
      # Redirigir todas las rutas de api/v1 a la raíz
      post 'register', to: '/auth#register'
      post 'login', to: '/auth#login'
      get 'profile', to: '/users#profile'
      put 'profile', to: '/users#update'
      
      resources :listings, only: [:index, :show, :create, :update, :destroy], controller: '/listings' do
        member do
          post :increment_view
        end
      end
      
      resources :swipes, only: [:create], controller: '/swipes' do
        collection do
          get :potential
          get :history
        end
      end
      
      resources :matches, only: [:index, :show], controller: '/matches' do
        member do
          patch :archive
          patch :block
          patch :activate
        end
        collection do
          get :stats
        end
        
        resources :messages, only: [:index, :create], controller: '/messages' do
          member do
            patch :mark_as_read
          end
          collection do
            patch :mark_all_as_read
            get :unread_count
          end
        end
      end
      
      get 'messages/unread_total', to: '/messages#unread_total'
    end
  end

  # Defines the root path route ("/")
  # root "posts#index"
end
