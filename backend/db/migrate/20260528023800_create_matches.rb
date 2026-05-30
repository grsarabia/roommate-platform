class CreateMatches < ActiveRecord::Migration[8.1]
  def change
    create_table :matches do |t|
      t.references :user, null: false, foreign_key: true
      t.integer :matched_id, null: false
      t.string :matched_type, null: false
      t.integer :compatibility_score, default: 0
      t.string :status, default: 'active'

      t.timestamps
    end
    
    # Índice único para evitar duplicados
    add_index :matches, [:user_id, :matched_id, :matched_type], unique: true, name: 'index_matches_unique'
    # Índice para buscar matches por usuario y status
    add_index :matches, [:user_id, :status]
    # Índice para buscar por matched (para queries bidireccionales)
    add_index :matches, [:matched_id, :matched_type]
  end
end
