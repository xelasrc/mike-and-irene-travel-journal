'use client'

import { useState, useTransition } from 'react'
import { MessageCircle, Reply, Trash2, Loader2 } from 'lucide-react'
import { createComment, deleteComment } from '@/app/actions/comments'
import { buildCommentTree, formatRelativeDate } from '@/lib/utils'
import type { Comment, CommentWithReplies, Profile } from '@/lib/types'

interface CommentThreadProps {
  initialComments: Comment[]
  postId: string
  postSlug: string
  currentUser: Pick<Profile, 'id' | 'display_name' | 'role'> | null
}

export default function CommentThread({
  initialComments,
  postId,
  postSlug,
  currentUser,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const tree = buildCommentTree(comments)

  function handleNewComment(comment: Comment) {
    setComments(prev => [...prev, comment])
  }

  function handleDeleteComment(commentId: string) {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  return (
    <section id="comments" className="mt-10 pt-8 border-t border-warm-border">
      <h2 className="font-serif text-2xl font-semibold text-warm-text mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-warm-accent" />
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h2>

      {currentUser ? (
        <div className="mb-8">
          <CommentForm
            postId={postId}
            postSlug={postSlug}
            currentUser={currentUser}
            onSuccess={handleNewComment}
          />
        </div>
      ) : (
        <div className="mb-8 rounded-xl border border-warm-border bg-warm-bg-2 p-4 text-center">
          <p className="text-warm-muted text-sm">
            <a href="/login" className="text-warm-accent font-medium hover:underline">Sign in</a>
            {' '}or{' '}
            <a href="/register" className="text-warm-accent font-medium hover:underline">create an account</a>
            {' '}to leave a comment.
          </p>
        </div>
      )}

      {tree.length === 0 ? (
        <p className="text-warm-muted text-sm text-center py-6">
          No comments yet — be the first to say something!
        </p>
      ) : (
        <div className="space-y-0">
          {tree.map(comment => (
            <CommentNode
              key={comment.id}
              comment={comment}
              postId={postId}
              postSlug={postSlug}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onNewComment={handleNewComment}
              onDeleteComment={handleDeleteComment}
              depth={0}
            />
          ))}
        </div>
      )}
    </section>
  )
}

interface CommentNodeProps {
  comment: CommentWithReplies
  postId: string
  postSlug: string
  currentUser: Pick<Profile, 'id' | 'display_name' | 'role'> | null
  replyingTo: string | null
  setReplyingTo: (id: string | null) => void
  onNewComment: (comment: Comment) => void
  onDeleteComment: (id: string) => void
  depth: number
}

function CommentNode({
  comment, postId, postSlug, currentUser,
  replyingTo, setReplyingTo,
  onNewComment, onDeleteComment,
  depth,
}: CommentNodeProps) {
  const [isPending, startTransition] = useTransition()
  const visualDepth = Math.min(depth, 3)
  const isOwn = currentUser?.id === comment.author_id
  const isAdmin = currentUser?.role === 'admin'

  function handleDelete() {
    startTransition(async () => {
      await deleteComment(comment.id, postSlug)
      onDeleteComment(comment.id)
    })
  }

  return (
    <div className={visualDepth > 0 ? 'ml-5 sm:ml-8 border-l-2 border-warm-border pl-4 sm:pl-5' : ''}>
      <div className="py-4 border-b border-warm-border/60">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-warm-accent/15 text-warm-accent flex items-center justify-center font-semibold text-sm shrink-0">
            {(comment.profiles?.display_name ?? 'A').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-sm text-warm-text">
                {comment.profiles?.display_name ?? 'Anonymous'}
              </span>
              {comment.profiles?.role === 'admin' && (
                <span className="text-xs bg-warm-accent text-white px-1.5 py-0.5 rounded-full leading-none">
                  Mike & Irene
                </span>
              )}
              <span className="text-xs text-warm-muted">
                {formatRelativeDate(comment.created_at)}
              </span>
            </div>

            <p className="text-sm text-warm-text leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>

            <div className="flex items-center gap-3 mt-2">
              {currentUser && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1 text-xs text-warm-muted hover:text-warm-accent transition-colors py-1"
                >
                  <Reply className="w-3.5 h-3.5" />
                  Reply
                </button>
              )}
              {(isOwn || isAdmin) && (
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="flex items-center gap-1 text-xs text-warm-muted hover:text-red-500 transition-colors disabled:opacity-50 py-1"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {replyingTo === comment.id && currentUser && (
        <div className="py-3 ml-11">
          <CommentForm
            postId={postId}
            postSlug={postSlug}
            parentId={comment.id}
            currentUser={currentUser}
            onSuccess={c => { onNewComment(c); setReplyingTo(null) }}
            onCancel={() => setReplyingTo(null)}
            autoFocus
            compact
          />
        </div>
      )}

      {comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <CommentNode
              key={reply.id}
              comment={reply}
              postId={postId}
              postSlug={postSlug}
              currentUser={currentUser}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onNewComment={onNewComment}
              onDeleteComment={onDeleteComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentFormProps {
  postId: string
  postSlug: string
  parentId?: string
  currentUser: Pick<Profile, 'id' | 'display_name' | 'role'>
  onSuccess: (comment: Comment) => void
  onCancel?: () => void
  autoFocus?: boolean
  compact?: boolean
}

function CommentForm({
  postId, postSlug, parentId, currentUser,
  onSuccess, onCancel, autoFocus, compact,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setError(null)

    startTransition(async () => {
      try {
        await createComment({ postId, postSlug, content, parentId })
        const optimistic: Comment = {
          id: `optimistic-${Date.now()}`,
          post_id: postId,
          author_id: currentUser.id,
          parent_id: parentId ?? null,
          content: content.trim(),
          created_at: new Date().toISOString(),
          profiles: { display_name: currentUser.display_name, role: currentUser.role },
        }
        setContent('')
        onSuccess(optimistic)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post comment.')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={parentId ? `Replying as ${currentUser.display_name}…` : `Add a comment as ${currentUser.display_name}…`}
        autoFocus={autoFocus}
        rows={compact ? 2 : 3}
        className="w-full rounded-xl border border-warm-border bg-warm-bg px-4 py-3 text-sm text-warm-text placeholder-warm-muted focus:outline-none focus:ring-2 focus:ring-warm-accent/30 focus:border-warm-accent resize-none transition"
      />
      {error && <p className="text-red-500 text-xs">{error}</p>}
      <div className="flex items-center gap-2 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-warm-muted hover:text-warm-text transition-colors px-2 py-1"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || !content.trim()}
          className="flex items-center gap-1.5 bg-warm-accent text-white text-sm px-4 py-2 rounded-full hover:bg-warm-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {parentId ? 'Reply' : 'Comment'}
        </button>
      </div>
    </form>
  )
}
