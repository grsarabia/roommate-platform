class AddViewsCountToListings < ActiveRecord::Migration[8.1]
  def change
    add_column :listings, :views_count, :integer, default: 0, null: false
  end
end
