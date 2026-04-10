import { useState, useEffect, useRef, useCallback } from 'react'
import PageLayout from '@/components/layout/PageLayout'
import api from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Bone, SkeletonLine, SkeletonMessageCard } from '@/components/shared/Skeleton'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ParticipantInfo {
  id: number
  name: string
  role: string
}

interface LastMessage {
  id: number
  sender_name: string
  body: string
  created_at: string
  is_read: boolean
}

interface Conversation {
  id: number
  participants: number[]
  participants_info: ParticipantInfo[]
  category: string
  subject: string
  last_message: LastMessage | null
  unread_count: number
  created_at: string
}

interface Message {
  id: number
  conversation: number
  sender: number
  sender_name: string
  body: string
  is_read: boolean
  attachment: string | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CATEGORIES = ['All', 'Internal', 'Parents', 'System'] as const
type Category = (typeof CATEGORIES)[number]

const CATEGORY_ICONS: Record<Category, string> = {
  All: 'inbox',
  Internal: 'group',
  Parents: 'family_restroom',
  System: 'notification_important',
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/* ------------------------------------------------------------------ */
/*  New Conversation Modal                                             */
/* ------------------------------------------------------------------ */

function NewConversationModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (conv: Conversation) => void
}) {
  const [subject, setSubject] = useState('')
  const [participantSearch, setParticipantSearch] = useState('')
  const [selectedParticipants, setSelectedParticipants] = useState<number[]>([])
  const [searchResults, setSearchResults] = useState<ParticipantInfo[]>([])
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [category, setCategory] = useState('Internal')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!participantSearch.trim()) {
      setSearchResults([])
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true)
        const res = await api.get('/shared/users/search/', { params: { q: participantSearch } })
        setSearchResults(res.data.data ?? res.data)
      } catch {
        setSearchResults([])
      } finally {
        setSearching(false)
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [participantSearch])

  const handleCreate = async () => {
    if (!subject.trim() || selectedParticipants.length === 0) return
    try {
      setCreating(true)
      const res = await api.post('/shared/conversations/', {
        participants: selectedParticipants,
        category,
        subject: subject.trim(),
      })
      onCreated(res.data.data ?? res.data)
      setSubject('')
      setSelectedParticipants([])
      setParticipantSearch('')
      onClose()
    } catch {
      // Error handled silently; could add toast here
    } finally {
      setCreating(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true" aria-label="New conversation">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-lg">New Conversation</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-container-high rounded-lg" aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Conversation subject..."
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
            >
              <option value="Internal">Internal</option>
              <option value="Parents">Parents</option>
              <option value="System">System</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-2">
              Add Participants
            </label>
            <input
              type="text"
              value={participantSearch}
              onChange={(e) => setParticipantSearch(e.target.value)}
              placeholder="Search by name..."
              className="w-full bg-surface-container-low border-none rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20"
            />
            {searching && <p className="text-xs text-on-surface-variant mt-1">Searching...</p>}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-32 overflow-y-auto space-y-1">
                {searchResults
                  .filter((u) => !selectedParticipants.includes(u.id))
                  .map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedParticipants((prev) => [...prev, u.id])}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-high text-sm flex justify-between items-center"
                    >
                      <span>{u.name}</span>
                      <span className="text-[10px] text-on-surface-variant uppercase">{u.role}</span>
                    </button>
                  ))}
              </div>
            )}
            {selectedParticipants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedParticipants.map((pid) => {
                  const info = searchResults.find((u) => u.id === pid)
                  return (
                    <span key={pid} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      {info?.name ?? `User #${pid}`}
                      <button
                        type="button"
                        onClick={() => setSelectedParticipants((prev) => prev.filter((x) => x !== pid))}
                        className="hover:text-error"
                        aria-label={`Remove ${info?.name ?? 'participant'}`}
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:bg-surface-container-high rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={creating || !subject.trim() || selectedParticipants.length === 0}
            className="px-5 py-2 bg-primary text-on-primary text-sm font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function MessagingPage() {
  const { user } = useAuth()

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [convoLoading, setConvoLoading] = useState(true)
  const [convoError, setConvoError] = useState<string | null>(null)

  // Messages for selected conversation
  const [selectedConvoId, setSelectedConvoId] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [msgLoading, setMsgLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<Category>('All')

  // New message input
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)

  // New conversation modal
  const [showNewConvo, setShowNewConvo] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  useEffect(() => {
    let cancelled = false
    async function fetchConversations() {
      try {
        setConvoLoading(true)
        setConvoError(null)
        const res = await api.get('/shared/conversations/')
        if (cancelled) return
        const data = res.data.results ?? res.data.data ?? res.data
        setConversations(Array.isArray(data) ? data : [])
      } catch (err: unknown) {
        if (!cancelled) {
          setConvoError(err instanceof Error ? err.message : 'Failed to load conversations.')
        }
      } finally {
        if (!cancelled) setConvoLoading(false)
      }
    }
    fetchConversations()
    return () => {
      cancelled = true
    }
  }, [])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConvoId === null) {
      setMessages([])
      return
    }
    let cancelled = false
    async function fetchMessages() {
      try {
        setMsgLoading(true)
        const res = await api.get('/shared/messages/', { params: { conversation: selectedConvoId } })
        if (cancelled) return
        const data = res.data.results ?? res.data.data ?? res.data
        setMessages(Array.isArray(data) ? data : [])
      } catch {
        if (!cancelled) setMessages([])
      } finally {
        if (!cancelled) setMsgLoading(false)
      }
    }
    fetchMessages()
    return () => {
      cancelled = true
    }
  }, [selectedConvoId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (activeCategory !== 'All' && c.category.toLowerCase() !== activeCategory.toLowerCase()) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      const matchSubject = c.subject.toLowerCase().includes(q)
      const matchParticipant = c.participants_info.some((p) => p.name.toLowerCase().includes(q))
      const matchBody = c.last_message?.body.toLowerCase().includes(q)
      if (!matchSubject && !matchParticipant && !matchBody) return false
    }
    return true
  })

  const selectedConvo = conversations.find((c) => c.id === selectedConvoId) ?? null

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConvoId || sending) return
    try {
      setSending(true)
      const res = await api.post('/shared/messages/', {
        conversation: selectedConvoId,
        body: newMessage.trim(),
      })
      const sent: Message = res.data.data ?? res.data
      setMessages((prev) => [...prev, sent])
      setNewMessage('')
      // Update last_message in conversations list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConvoId
            ? {
                ...c,
                last_message: {
                  id: sent.id,
                  sender_name: sent.sender_name,
                  body: sent.body,
                  created_at: sent.created_at,
                  is_read: true,
                },
              }
            : c,
        ),
      )
    } catch {
      // Silent fail; could add toast
    } finally {
      setSending(false)
    }
  }, [newMessage, selectedConvoId, sending])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendMessage()
      }
    },
    [handleSendMessage],
  )

  const handleNewConversationCreated = useCallback((conv: Conversation) => {
    setConversations((prev) => [conv, ...prev])
    setSelectedConvoId(conv.id)
  }, [])

  const getOtherParticipants = (convo: Conversation): string => {
    const others = convo.participants_info.filter((p) => p.id !== user?.id)
    if (others.length === 0) return convo.subject
    return others.map((p) => p.name).join(', ')
  }

  return (
    <PageLayout>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-32">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="font-label text-xs font-semibold tracking-widest text-on-surface-variant uppercase mb-2 block">
              Communications Hub
            </span>
            <h2 className="font-headline font-extrabold text-3xl md:text-4xl text-on-surface tracking-tight">
              Messaging Center
            </h2>
          </div>
          <button
            onClick={() => setShowNewConvo(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-lg">edit_square</span>
            New Conversation
          </button>
        </div>

        {/* Error State */}
        {convoError && (
          <div className="bg-error/10 text-error rounded-xl p-6 text-center mb-6" role="alert">
            <p className="font-medium">{convoError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" style={{ minHeight: '70vh' }}>
          {/* Left Panel: Conversation List */}
          <aside className="lg:col-span-4 space-y-4 flex flex-col">
            {/* Search */}
            <div className="bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-on-surface-variant/50">search</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:ring-0 text-sm"
                  placeholder="Search conversations..."
                  aria-label="Search conversations"
                />
              </div>
            </div>

            {/* Category Filters */}
            <nav className="space-y-1" aria-label="Conversation categories">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat
                const unreadForCat =
                  cat === 'All'
                    ? totalUnread
                    : conversations
                        .filter((c) => c.category.toLowerCase() === cat.toLowerCase())
                        .reduce((sum, c) => sum + c.unread_count, 0)
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all ${
                      isActive
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="material-symbols-outlined"
                        style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {CATEGORY_ICONS[cat]}
                      </span>
                      <span className="text-sm">{cat === 'All' ? 'All Messages' : cat}</span>
                    </div>
                    {unreadForCat > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          cat === 'Parents' ? 'bg-error text-on-error' : 'bg-primary text-on-primary'
                        }`}
                      >
                        {unreadForCat}
                      </span>
                    )}
                  </button>
                )
              })}
            </nav>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto space-y-2 mt-2" role="list" aria-label="Conversations">
              {convoLoading &&
                Array.from({ length: 4 }).map((_, i) => <SkeletonMessageCard key={i} />)}

              {!convoLoading && filteredConversations.length === 0 && (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-2 block">
                    forum
                  </span>
                  <p className="text-on-surface-variant text-sm">No conversations found.</p>
                </div>
              )}

              {!convoLoading &&
                filteredConversations.map((convo) => {
                  const isSelected = convo.id === selectedConvoId
                  const hasUnread = convo.unread_count > 0
                  return (
                    <button
                      key={convo.id}
                      type="button"
                      onClick={() => setSelectedConvoId(convo.id)}
                      className={`w-full text-left p-4 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-surface-container-lowest border-l-4 border-primary shadow-sm'
                          : 'bg-surface-container-low border-l-4 border-transparent hover:bg-surface-container-lowest'
                      }`}
                      role="listitem"
                      aria-current={isSelected ? 'true' : undefined}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                          <span className="text-on-primary-container text-xs font-bold">
                            {getInitials(getOtherParticipants(convo))}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <h4 className={`text-sm truncate ${hasUnread ? 'font-bold text-on-surface' : 'font-medium text-on-surface'}`}>
                              {getOtherParticipants(convo)}
                            </h4>
                            {convo.last_message && (
                              <span className="text-[10px] text-on-surface-variant/60 uppercase shrink-0 ml-2">
                                {formatTime(convo.last_message.created_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-primary/80 italic mb-0.5">
                            {convo.category} {convo.subject ? `\u00b7 ${convo.subject}` : ''}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-xs text-on-surface-variant line-clamp-1">
                              {convo.last_message?.body ?? 'No messages yet'}
                            </p>
                            {hasUnread && (
                              <span className="w-2 h-2 bg-primary rounded-full shrink-0 ml-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          </aside>

          {/* Right Panel: Messages */}
          <section className="lg:col-span-8 bg-surface-container-lowest rounded-xl flex flex-col overflow-hidden border border-outline-variant/10">
            {selectedConvo === null ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4">chat</span>
                <h3 className="font-headline font-bold text-lg text-on-surface mb-2">Select a conversation</h3>
                <p className="text-on-surface-variant text-sm max-w-xs">
                  Choose a conversation from the left panel or start a new one.
                </p>
              </div>
            ) : (
              <>
                {/* Conversation Header */}
                <div className="px-6 py-4 border-b border-surface-container-high flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Back button for mobile */}
                    <button
                      onClick={() => setSelectedConvoId(null)}
                      className="lg:hidden p-1 hover:bg-surface-container-high rounded-lg"
                      aria-label="Back to conversations"
                    >
                      <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="min-w-0">
                      <h3 className="font-bold text-on-surface truncate">{getOtherParticipants(selectedConvo)}</h3>
                      <p className="text-xs text-on-surface-variant">{selectedConvo.subject}</p>
                    </div>
                  </div>
                  <span className="bg-tertiary/10 text-tertiary text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {selectedConvo.category}
                  </span>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" role="log" aria-label="Messages">
                  {msgLoading && (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className="max-w-[70%] space-y-2">
                            <SkeletonLine width="w-20" height="h-3" />
                            <Bone className="w-48 h-12 rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {!msgLoading && messages.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-on-surface-variant text-sm">No messages yet. Start the conversation.</p>
                    </div>
                  )}

                  {!msgLoading &&
                    messages.map((msg) => {
                      const isMe = msg.sender === user?.id
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-semibold text-on-surface-variant">
                                {isMe ? 'You' : msg.sender_name}
                              </span>
                              <span className="text-[10px] text-on-surface-variant/50">
                                {formatTime(msg.created_at)}
                              </span>
                            </div>
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                isMe
                                  ? 'bg-primary text-on-primary rounded-br-md'
                                  : 'bg-surface-container-high text-on-surface rounded-bl-md'
                              }`}
                            >
                              {msg.body}
                            </div>
                            {msg.attachment && (
                              <a
                                href={msg.attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-primary mt-1 hover:underline"
                              >
                                <span className="material-symbols-outlined text-xs">attach_file</span>
                                Attachment
                              </a>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="px-6 py-4 border-t border-surface-container-high">
                  <div className="flex items-end gap-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-primary/20 max-h-32"
                      aria-label="Message input"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="p-3 bg-primary text-on-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all shrink-0"
                      aria-label="Send message"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {sending ? 'hourglass_top' : 'send'}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      <NewConversationModal
        open={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        onCreated={handleNewConversationCreated}
      />
    </PageLayout>
  )
}
