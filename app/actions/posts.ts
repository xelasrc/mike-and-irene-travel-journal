'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { generateSlug, generateExcerpt } from '@/lib/utils'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') throw new Error('Not authorised.')
  return { supabase, user }
}

export async function createPost(data: {
  title: string
  location: string
  content: string
  published: boolean
  imageUrls: string[]
}) {
  const { supabase, user } = await assertAdmin()
  const { title, location, content, published, imageUrls } = data

  const slug = generateSlug(title)
  const excerpt = generateExcerpt(content)
  const coverImageUrl = imageUrls[0] ?? null

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      title,
      slug,
      location: location || null,
      content,
      excerpt,
      cover_image_url: coverImageUrl,
      author_id: user.id,
      published,
    })
    .select('id, slug')
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('A post with this title already exists today. Try a slightly different title.')
    throw new Error('Failed to create post.')
  }

  if (imageUrls.length > 0) {
    await supabase.from('post_images').insert(
      imageUrls.map((url, i) => ({
        post_id: post.id,
        image_url: url,
        display_order: i,
      }))
    )
  }

  revalidatePath('/')
  revalidatePath('/admin')
  redirect(published ? `/posts/${post.slug}` : '/admin')
}

export async function updatePost(data: {
  postId: string
  title: string
  location: string
  content: string
  published: boolean
  imageUrls: string[]
  existingSlug: string
}) {
  const { supabase } = await assertAdmin()
  const { postId, title, location, content, published, imageUrls, existingSlug } = data

  const excerpt = generateExcerpt(content)
  const coverImageUrl = imageUrls[0] ?? null

  const { error } = await supabase
    .from('posts')
    .update({
      title,
      location: location || null,
      content,
      excerpt,
      cover_image_url: coverImageUrl,
      published,
      updated_at: new Date().toISOString(),
    })
    .eq('id', postId)

  if (error) throw new Error('Failed to update post.')

  // Replace images
  await supabase.from('post_images').delete().eq('post_id', postId)

  if (imageUrls.length > 0) {
    await supabase.from('post_images').insert(
      imageUrls.map((url, i) => ({
        post_id: postId,
        image_url: url,
        display_order: i,
      }))
    )
  }

  revalidatePath('/')
  revalidatePath(`/posts/${existingSlug}`)
  revalidatePath('/admin')
  redirect('/admin')
}

export async function deletePost(postId: string) {
  const { supabase } = await assertAdmin()

  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw new Error('Failed to delete post.')

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function togglePublished(postId: string, published: boolean, slug: string) {
  const { supabase } = await assertAdmin()

  const { error } = await supabase
    .from('posts')
    .update({ published, updated_at: new Date().toISOString() })
    .eq('id', postId)

  if (error) throw new Error('Failed to update post.')

  revalidatePath('/')
  revalidatePath(`/posts/${slug}`)
  revalidatePath('/admin')
}
