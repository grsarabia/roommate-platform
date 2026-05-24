class CreateUsersProfilesListings < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :email, null:false, index: { unique: true }
      t.string :encrypted_password
      t.string :phone
      t.boolean :verified_email, default: false
      t.boolean :verified_id, default: false
      t.string :role, default: 'user'
      t.timestamps
    end

    create_table :profiles do |t|
      t.references :user, null:false, foreign_key: true
      t.string :name
      t.integer :age
      t.string :photo_url
      t.string :occupation
      t.string :institution
      t.text :bio
      t.integer :budget_min
      t.integer :budget_max
      t.string :comuna
      t.jsonb :habits, default: {}
      t.boolean :smoker, default: false
      t.boolean :pets, default: false
      t.jsonb :social_links, default: {}
      t.float :reputation_score, default: 0.0
      t.timestamps
    end

    create_table :listings do |t|
      t.references :owner, null:false, foreign_key: { to_table: :users }
      t.string :title
      t.text :description
      t.integer :price
      t.boolean :gastos_incluidos, default: false
      t.string :address_text
      t.float :lat
      t.float :lng
      t.string :comuna
      t.jsonb :rules, default: {}
      t.jsonb :services, default: {}
      t.jsonb :availability, default: {}
      t.jsonb :photos, default: []
      t.timestamps
    end
  end
end
