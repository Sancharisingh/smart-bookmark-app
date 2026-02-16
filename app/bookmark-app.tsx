'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function BookmarkApp({ user }: any) {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!user?.id) return

    fetchBookmarks()

    const channel = supabase
      .channel('realtime-bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  async function fetchBookmarks() {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  async function addBookmark(e: React.FormEvent) {
    e.preventDefault()
    if (!url || !title) return

    const { data, error } = await supabase.from('bookmarks').insert([
      {
        url,
        title,
        user_id: user.id,
      },
    ]).select()

    if (!error && data) {
      // Optimistically update UI immediately
      setBookmarks((prev) => [data[0], ...prev])
      setUrl('')
      setTitle('')
    }
  }

  async function deleteBookmark(id: string) {
    await supabase.from('bookmarks').delete().eq('id', id)
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Smart Bookmark</h1>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            window.location.href = '/'
          }}
          className="text-red-500"
        >
          Logout
        </button>
      </div>

      <form onSubmit={addBookmark} className="space-y-2 mb-6">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border p-2"
          required
        />
        <input
          placeholder="URL"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border p-2"
          required
        />
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
        >
          Add Bookmark
        </button>
      </form>

      <div className="space-y-3">
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="border p-3 flex justify-between items-center"
          >
            <div>
              <a
                href={b.url}
                target="_blank"
                className="font-semibold underline"
              >
                {b.title}
              </a>
            </div>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

