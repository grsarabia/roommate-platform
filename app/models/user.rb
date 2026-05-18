class User < ApplicationRecord
  has_secure_password
  has_one :profile, dependent: :destroy
  has_many :listings, dependent: :destroy
  has_many :conversations, foreign_key: :sender_id
  has_many :messages, dependent: :destroy

  enum role: { user: 0, admin: 1 }, _default: "user"
  enum status: { active: 0, inactive: 1 }, _default: "active"

  validates :email, presence: true, uniqueness: true
end
