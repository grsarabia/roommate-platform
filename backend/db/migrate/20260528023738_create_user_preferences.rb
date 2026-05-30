class CreateUserPreferences < ActiveRecord::Migration[8.1]
  def change
    create_table :user_preferences do |t|
      t.references :user, null: false, foreign_key: true
      t.string :genero_preferido
      t.integer :edad_min
      t.integer :edad_max
      t.integer :precio_min
      t.integer :precio_max
      t.jsonb :comunas_preferidas
      t.boolean :con_mascotas_ok
      t.boolean :fumador_ok
      t.integer :nivel_limpieza_min
      t.string :horarios_compatibles

      t.timestamps
    end
  end
end
