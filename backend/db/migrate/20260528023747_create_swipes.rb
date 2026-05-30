class CreateSwipes < ActiveRecord::Migration[8.1]
  def change
    create_table :swipes do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :target_id, null: false
      t.string :target_type, null: false
      t.string :direction, null: false

      t.timestamps
    end
    
    # Índice único para evitar duplicados (un usuario solo puede hacer swipe una vez a un target)
    add_index :swipes, [:user_id, :target_id, :target_type], unique: true, name: 'index_swipes_unique'
    # Índice para buscar swipes por target
    add_index :swipes, [:target_id, :target_type]
  end
end
