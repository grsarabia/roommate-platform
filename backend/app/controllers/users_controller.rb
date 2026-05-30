class UsersController < ApplicationController
  include Authenticable

  def profile
    render json: { user: current_user }, status: :ok
  end

  def update
    # Mapear campos del frontend a nombres de columna correctos
    mapped_params = map_user_params
    
    ActiveRecord::Base.transaction do
      # Actualizar usuario
      unless current_user.update(mapped_params[:user])
        render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        raise ActiveRecord::Rollback
      end
      
      # Crear o actualizar preferencias si son demandantes o ambos
      if mapped_params[:preferences].present? && current_user.es_demandante?
        preference = current_user.user_preference || current_user.build_user_preference
        unless preference.update(mapped_params[:preferences])
          render json: { 
            errors: preference.errors.full_messages,
            field_errors: preference.errors.messages 
          }, status: :unprocessable_entity
          raise ActiveRecord::Rollback
        end
      end
      
      render json: { user: current_user, preferences: current_user.user_preference }, status: :ok
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { 
      errors: e.record.errors.full_messages,
      field_errors: e.record.errors.messages
    }, status: :unprocessable_entity
  end

  private

  def map_user_params
    user_attrs = {}
    preference_attrs = {}
    
    # Mapeo de campos de usuario
    user_attrs[:nombre] = params[:nombre] if params.key?(:nombre)
    user_attrs[:edad] = params[:edad] if params.key?(:edad)
    user_attrs[:genero] = params[:genero] if params.key?(:genero)
    user_attrs[:bio] = params[:bio] if params.key?(:bio)
    user_attrs[:foto_perfil] = params[:foto_perfil] if params.key?(:foto_perfil)
    user_attrs[:ocupacion] = params[:ocupacion] if params.key?(:ocupacion)
    user_attrs[:profesion] = params[:profesion] if params.key?(:profesion)
    user_attrs[:tipo_usuario] = params[:tipo_usuario] if params.key?(:tipo_usuario)
    user_attrs[:onboarding_completed] = params[:onboarding_completed] if params.key?(:onboarding_completed)
    
    # Mapeo de campos con nombres diferentes
    user_attrs[:phone] = params[:telefono] if params.key?(:telefono)
    user_attrs[:es_fumador] = params[:fuma] if params.key?(:fuma)
    user_attrs[:tiene_mascota] = params[:tiene_mascotas] if params.key?(:tiene_mascotas)
    user_attrs[:horarios] = params[:horario_trabajo] if params.key?(:horario_trabajo)
    
    # Campos de lifestyle
    user_attrs[:nivel_limpieza] = params[:nivel_limpieza] if params.key?(:nivel_limpieza)
    user_attrs[:nivel_ruido] = params[:nivel_ruido] if params.key?(:nivel_ruido)
    
    # Arrays JSON
    user_attrs[:hobbies] = params[:hobbies] if params.key?(:hobbies)
    user_attrs[:personalidad] = params[:rasgos_personalidad] if params.key?(:rasgos_personalidad)
    
    # Mapeo de campos de preferencias (solo para demandantes/ambos)
    if params.key?(:presupuesto_min) || params.key?(:genero_preferido)
      preference_attrs[:precio_min] = params[:presupuesto_min] if params.key?(:presupuesto_min)
      preference_attrs[:precio_max] = params[:presupuesto_max] if params.key?(:presupuesto_max)
      preference_attrs[:genero_preferido] = params[:genero_preferido] if params.key?(:genero_preferido)
      preference_attrs[:edad_min] = params[:edad_min] if params.key?(:edad_min)
      preference_attrs[:edad_max] = params[:edad_max] if params.key?(:edad_max)
      preference_attrs[:comunas_preferidas] = params[:comunas_preferidas] if params.key?(:comunas_preferidas)
      preference_attrs[:fumador_ok] = params[:acepta_fumadores] if params.key?(:acepta_fumadores)
      preference_attrs[:con_mascotas_ok] = params[:acepta_mascotas] if params.key?(:acepta_mascotas)
      preference_attrs[:nivel_limpieza_min] = params[:nivel_limpieza] if params.key?(:nivel_limpieza)
    end
    
    { user: user_attrs, preferences: preference_attrs }
  end
end
