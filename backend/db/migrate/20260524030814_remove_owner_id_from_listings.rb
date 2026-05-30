class RemoveOwnerIdFromListings < ActiveRecord::Migration[8.1]
  def change
    remove_column :listings, :owner_id, :integer
  end
end
