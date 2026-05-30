class Match < ApplicationRecord
  belongs_to :user
  belongs_to :matched, polymorphic: true
  has_many :messages, dependent: :destroy
  
  # Validaciones
  validates :user_id, uniqueness: { scope: [:matched_id, :matched_type] }
  validates :status, inclusion: { in: %w[active archived blocked] }
  validates :compatibility_score, numericality: { in: 0..100, allow_nil: true }
  
  # Scopes
  scope :active, -> { where(status: 'active') }
  scope :archived, -> { where(status: 'archived') }
  scope :blocked, -> { where(status: 'blocked') }
  scope :recent, -> { order(created_at: :desc) }
  scope :by_score, -> { order(compatibility_score: :desc) }
  scope :with_unread_messages, -> {
    joins(:messages)
      .where(messages: { read_at: nil })
      .distinct
  }
  
  # Métodos
  def other_user(current_user = nil)
    # Si se pasa un current_user, verificamos si este match pertenece a ese usuario
    return nil if current_user && user_id != current_user.id
    
    return matched if matched_type == 'User'
    matched.user if matched_type == 'Listing'
  end
  
  def listing
    matched if matched_type == 'Listing'
  end
  
  def last_message
    messages.order(created_at: :desc).first
  end
  
  def unread_count(for_user)
    messages.where(read_at: nil).where.not(sender_id: for_user.id).count
  end
  
  def archive!
    update(status: 'archived')
  end
  
  def block!
    update(status: 'blocked')
  end
  
  def activate!
    update(status: 'active')
  end
  
  def active?
    status == 'active'
  end
  
  def archived?
    status == 'archived'
  end
  
  def blocked?
    status == 'blocked'
  end
end
