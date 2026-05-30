class CreateMessages < ActiveRecord::Migration[8.1]
  def change
    create_table :messages do |t|
      t.references :match, null: false, foreign_key: true
      t.references :sender, null: false, foreign_key: { to_table: :users }
      t.text :content, null: false
      t.datetime :read_at

      t.timestamps
    end
    
    # Índice para ordenar mensajes por conversación
    add_index :messages, [:match_id, :created_at]
    # Índice para mensajes no leídos
    add_index :messages, [:match_id, :read_at]
  end
end
