class Room < ApplicationRecord
  belongs_to :listing

  validates :name, :size_sqm, presence: true
end
