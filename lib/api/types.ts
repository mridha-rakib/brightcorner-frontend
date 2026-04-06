export type ApiSuccessEnvelope<T> = {
  success: true
  message: string
  data: T
  timestamp: string
}

export type MessageAttachment = {
  id: string
  mimeType: string
  name: string
  size: number
  url: string
}

export type UserProfile = {
  username?: string
  bio?: string
  avatarUrl?: string
}

export type UserPrivacySettings = {
  messagePreference: 'everyone' | 'contacts' | 'nobody'
  anonymousMode: boolean
  onlineStatus: boolean
  publicProfile: boolean
  pinProtection: boolean
}

export type UserNotificationSettings = {
  emailNotifications: boolean
  channelMentions: boolean
  pinAlerts: boolean
  joinRequestAlerts: boolean
}

export type NotificationFeedItem = {
  content: string
  createdAt: string
  id: string
  isRead: boolean
  type: 'mention' | 'message' | 'following' | 'reaction'
  user: {
    avatar?: string
    name: string
  }
}

export type TwoFactorSettings = {
  deliveryLabel: string
  deliveryMethod: 'email'
  enabled: boolean
  expiresAt: string | null
  lastSentAt: string | null
}

export type SupportRequestCategory
  = 'general_inquiry'
    | 'technical_support'
    | 'billing_question'
    | 'feedback'

export type SupportRequest = {
  category: SupportRequestCategory
  createdAt: string
  email: string
  fullName: string
  id: string
  message: string
  status: 'open'
  subject: string
  updatedAt: string
}

export type PublicUser = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  role: 'user' | 'admin'
  status: 'active' | 'blocked'
  profile: UserProfile
  privacySettings: UserPrivacySettings
  notificationSettings: UserNotificationSettings
  onboardingCompleted: boolean
  isTwoFactorEnabled: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export type ChannelQuestion = {
  questionId: string
  text: string
  options: string[]
}

export type ChannelSummary = {
  id: string
  type: 'channel'
  name: string
  description?: string
  iconUrl?: string
  isPublic: boolean
  isEncrypted: true
  joinStatus: 'joined' | 'not_joined' | 'pending'
  members: number
  totalAdmins: number
  online: number
  lastMessage: string | null
  lastMessageAt: string | null
}

export type ChannelDetail = ChannelSummary & {
  questions: ChannelQuestion[]
}

export type ChannelMember = {
  userId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
  isOnline: boolean
  user: Pick<PublicUser, 'id' | 'firstName' | 'lastName' | 'fullName' | 'email' | 'profile'>
}

export type ConversationSummary = {
  id: string
  type: 'dm'
  name: string
  avatarUrl?: string
  isEncrypted: true
  isPinProtected: boolean
  lastMessage: string | null
  lastMessageAt: string | null
  participant: PublicUser
}

export type MessageResponse = {
  attachments: MessageAttachment[]
  id: string
  chatType: 'channel' | 'conversation'
  chatId: string
  text: string
  pinned: boolean
  createdAt: string
  updatedAt: string
  sender: PublicUser
}

export type LegalContent = {
  type: 'privacy' | 'terms' | 'about'
  title: string
  content: string
  updatedBy?: string
  createdAt: string
  updatedAt: string
}

export type ChatListItem = ChannelDetail | ChannelSummary | ConversationSummary

export type AdminDashboardSummary = {
  totalUsers: number
  blockedUsers: number
  recentUsers: PublicUser[]
}

export type AdminUserSummary = PublicUser
export type AdminUserDetail = PublicUser
