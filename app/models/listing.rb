class Listing < ApplicationRecord
  belongs_to :user
  has_many :rooms, dependent: :destroy

  enum status: { active: 0, inactive: 1 }, _default: "active"

  validates :title, :description, :address, :price, presence: true
end
