export type Role = 'admin' | 'viewer'

export interface Profile {
  id: string
  display_name: string
  role: Role
  created_at: string
}

export interface Post {
  id: string
  slug: string
  title: string
  content: string
  excerpt: string | null
  location: string | null
  cover_image_url: string | null
  author_id: string
  published: boolean
  created_at: string
  updated_at: string
  profiles?: Pick<Profile, 'display_name'>
  post_images?: PostImage[]
  comment_count?: number
}

export interface PostImage {
  id: string
  post_id: string
  image_url: string
  caption: string | null
  display_order: number
  created_at: string
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  parent_id: string | null
  content: string
  created_at: string
  profiles?: Pick<Profile, 'display_name' | 'role'>
}

export interface CommentWithReplies extends Comment {
  replies: CommentWithReplies[]
}
