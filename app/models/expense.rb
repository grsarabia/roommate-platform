class Expense < ApplicationRecord
  belongs_to :creator, class_name: 'User'
  enum status: { pending: 0, settled: 1 }, _default: "pending"
end
