'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createComment(data: {
  postId: string
  postSlug: string
  content: string
  parentId?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('You must be logged in to comment.')

  const { content, postId, postSlug, parentId } = data

  if (!content.trim()) throw new Error('Comment cannot be empty.')

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    author_id: user.id,
    content: content.trim(),
    parent_id: parentId ?? null,
  })

  if (error) throw new Error('Failed to post comment.')

  revalidatePath(`/posts/${postSlug}`)
}

export async function deleteComment(commentId: string, postSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  // Allow delete if own comment or admin
  const { data: comment } = await supabase
    .from('comments')
    .select('author_id')
    .eq('id', commentId)
    .single()

  if (comment?.author_id !== user.id && profile?.role !== 'admin') {
    throw new Error('Not authorised.')
  }

  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) throw new Error('Failed to delete comment.')

  revalidatePath(`/posts/${postSlug}`)
}
