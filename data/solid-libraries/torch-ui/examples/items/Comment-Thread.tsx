import { createSignal, For } from 'solid-js'

import { Avatar } from '@torch-ui/solid/data-display'

import { TextArea } from '@torch-ui/solid/forms'

import { Button } from '@torch-ui/solid/actions'

import ThumbsUp from 'lucide-solid/icons/thumbs-up';
import Reply from 'lucide-solid/icons/reply';



interface Comment {
  id: string
  author: string
  initials: string
  avatarColor: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  time: string
  body: string
  likes: number
}

const INITIAL_COMMENTS: Comment[] = [
  {
    id: '1',
    author: 'Caelan Torchward',
    initials: 'CT',
    avatarColor: 'primary',
    time: '2 hours ago',
    body: 'Just finished clearing the Thornwood dungeon. The southern passage has a hidden lever behind the second bookshelf — took us 40 minutes to find it. Mark it on the map.',
    likes: 7,
  },
  {
    id: '2',
    author: 'Lyra Swiftfoot',
    initials: 'LS',
    avatarColor: 'info',
    time: '1 hour ago',
    body: 'Good to know! We were planning to run it this weekend. Any tips on the final boss? I heard the fire resistance potions are mandatory.',
    likes: 3,
  },
]

export function CommentThread() {
  const [comments, setComments] = createSignal<Comment[]>(INITIAL_COMMENTS)
  const [draft, setDraft] = createSignal('')
  const [submitting, setSubmitting] = createSignal(false)

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!draft().trim()) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 600))
    setComments((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: 'You',
        initials: 'YO',
        avatarColor: 'success',
        time: 'just now',
        body: draft(),
        likes: 0,
      },
    ])
    setDraft('')
    setSubmitting(false)
  }

  function handleLike(id: string) {
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    )
  }

  return (
    <div class="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <For each={comments()}>
        {(comment) => (
          <div class="flex gap-3">
            <Avatar name={comment.author} color={comment.avatarColor} size="md" shape="circle" class="shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="rounded-xl border border-surface-border bg-surface-raised px-4 py-3">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-sm font-semibold text-ink-900">{comment.author}</span>
                  <span class="shrink-0 text-xs text-ink-500">{comment.time}</span>
                </div>
                <p class="mt-1 text-sm text-ink-700">{comment.body}</p>
              </div>
              <div class="mt-1.5 flex items-center gap-3 px-1">
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors"
                  onClick={() => handleLike(comment.id)}
                >
                  <ThumbsUp class="h-3.5 w-3.5" aria-hidden="true" />
                  {comment.likes > 0 ? comment.likes : 'Like'}
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1.5 text-xs text-ink-500 hover:text-primary-600 transition-colors"
                >
                  <Reply class="h-3.5 w-3.5" aria-hidden="true" />
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}
      </For>

      <div class="flex gap-3">
        <Avatar name="You" color="success" size="md" shape="circle" class="shrink-0" />
        <form onSubmit={handleSubmit} class="min-w-0 flex-1 flex flex-col gap-2">
          <TextArea placeholder="Add a comment…" value={draft()} onValueChange={setDraft} rows={3} />
          <div class="flex justify-end">
            <Button type="submit" variant="primary" size="sm" loading={submitting()} disabled={!draft().trim()}>
              Post comment
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
import { render } from "solid-js/web";
export default function mount(target) { return render(() => <CommentThread />, target); }
