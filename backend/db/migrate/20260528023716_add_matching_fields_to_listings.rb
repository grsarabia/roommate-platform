class AddMatchingFieldsToListings < ActiveRecord::Migration[8.1]
  def change
    add_column :listings, :genero_requerido, :string
    add_column :listings, :edad_min, :integer
    add_column :listings, :edad_max, :integer
    add_column :listings, :ocupacion_preferida, :jsonb
    add_column :listings, :no_fumadores, :boolean
    add_column :listings, :no_mascotas, :boolean
    add_column :listings, :nivel_limpieza_minimo, :integer
    add_column :listings, :caracteristicas, :jsonb
    add_column :listings, :ambiente, :jsonb
    add_column :listings, :roommates_actuales, :integer
    add_column :listings, :total_roommates, :integer
  end
end
