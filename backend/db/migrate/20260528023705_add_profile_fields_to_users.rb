class AddProfileFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :nombre, :string
    add_column :users, :edad, :integer
    add_column :users, :genero, :string
    add_column :users, :bio, :text
    add_column :users, :foto_perfil, :string
    add_column :users, :profesion, :string
    add_column :users, :ocupacion, :string
    add_column :users, :ingresos_rango, :string
    add_column :users, :horarios, :string
    add_column :users, :nivel_limpieza, :integer
    add_column :users, :nivel_ruido, :integer
    add_column :users, :tiene_mascota, :boolean
    add_column :users, :es_fumador, :boolean
    add_column :users, :visitas_frecuentes, :boolean
    add_column :users, :hobbies, :jsonb
    add_column :users, :personalidad, :jsonb
    add_column :users, :tipo_usuario, :string
    add_column :users, :onboarding_completed, :boolean
  end
end
