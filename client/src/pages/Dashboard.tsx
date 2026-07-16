/**
 * Dashboard Page — Premium Redesign
 * Glassmorphic sidebar, gradient accents, skeleton loaders, topic chips
 */

import { useState, FormEvent, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCourse } from '../context/CourseContext'
import { BookOpen, LogOut, Plus, Trash2, Loader, Search, Share2, Copy, Check, Github, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'

const SUGGESTED_TOPICS = [
  '🐍 Python Basics',
  '⚛️ React Hooks',
  '🤖 Machine Learning',
  '📊 Data Structures',
  '🎨 CSS Animations',
  '🔐 Cybersecurity',
  '📱 React Native',
  '☁️ Cloud Computing',
]

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { courses, generateCourse, saveCourse, fetchCourses, deleteCourse, shareCourse, loading } = useCourse()
  const [topic, setTopic] = useState('')
  const [error, setError] = useState('')
  const [generatedOutline, setGeneratedOutline] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [shareId, setShareId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchCourses(searchQuery)
  }, [searchQuery])

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setError('')
    setGeneratedOutline(null)

    try {
      const outline = await generateCourse(topic)
      setGeneratedOutline(outline)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  const handleSave = async () => {
    if (!generatedOutline || saving) return

    try {
      setSaving(true)
      toast.loading('Saving course...', { id: 'save' })
      const saved = await saveCourse(generatedOutline)
      toast.success('Course saved successfully!', { id: 'save' })
      setGeneratedOutline(null)
      setTopic('')
      setTimeout(() => {
        navigate(`/course/${saved.id}/module/0/lesson/0`)
      }, 500)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      toast.error(message, { id: 'save' })
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (courseId: string) => {
    if (confirm('Delete this course?')) {
      try {
        await deleteCourse(courseId)
        toast.success('Course deleted')
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed'
        toast.error(message)
        setError(message)
      }
    }
  }

  const handleShare = async (courseId: string) => {
    try {
      const id = await shareCourse(courseId)
      setShareId(id)
      toast.success('Share link generated!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Share failed'
      toast.error(message)
      setError(message)
    }
  }

  const handleCopyShareLink = () => {
    if (shareId) {
      const shareUrl = `${window.location.origin}/share/${shareId}`
      navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setShareId(null)
      }, 2000)
    }
  }

  // User initials for avatar
  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
        },
      }} />
    <div className="flex h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ===== SIDEBAR ===== */}
      <div className="w-72 flex flex-col relative" style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}>
        {/* Gradient accent line */}
        <div className="absolute top-0 right-0 w-[2px] h-full" style={{ background: 'var(--gradient-primary)', opacity: 0.15 }} />

        {/* Brand + User */}
        <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Text2Learn</span>
            </div>
            <a href="https://github.com/DineshDumka/Text2Learn" target="_blank" rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-110" style={{ color: 'var(--text-muted)' }} title="View on GitHub">
              <Github className="w-4 h-4" />
            </a>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'var(--gradient-primary)' }}>
              {initials}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{user?.name}</span>
          </div>
        </div>

        {/* Search */}
        <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all duration-300"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--glow-primary)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Course List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="text-xs font-semibold uppercase mb-3 tracking-wider" style={{ color: 'var(--text-muted)' }}>Your Courses</h3>
          {courses.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{searchQuery ? 'No courses found' : 'No courses yet'}</p>
            </div>
          ) : (
            courses.map((course) => (
              <div
                key={course.id}
                className="group p-3 rounded-lg cursor-pointer mb-1.5 transition-all duration-200"
                style={{ border: '1px solid transparent' }}
                onClick={() => navigate(`/course/${course.id}/module/0/lesson/0`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm truncate flex-1 transition-colors" style={{ color: 'var(--text-muted)' }}
                    onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--text-primary)'; }}
                    onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}>
                    {course.title}
                  </span>
                  <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleShare(course.id); }}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      title="Share course"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                      className="p-1.5 rounded-md transition-colors hover:text-red-400"
                      style={{ color: 'var(--text-muted)' }}
                      title="Delete course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Logout */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="btn-secondary w-full flex items-center justify-center gap-2 py-2.5 text-sm">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      {/* ===== SHARE MODAL ===== */}
      {shareId && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShareId(null)}>
          <div className="gradient-border rounded-2xl p-6 max-w-md w-full mx-4 animate-scaleIn"
            style={{ background: 'rgba(15,25,35,0.9)', backdropFilter: 'blur(16px)' }}
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Share Course</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Anyone with this link can view the course:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/share/${shareId}`}
                readOnly
                className="input-field flex-1 text-sm"
              />
              <button onClick={handleCopyShareLink} className="btn-primary flex items-center gap-2 px-4">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          {!generatedOutline ? (
            <div className="max-w-2xl mx-auto animate-fadeInUp">
              {/* Hero Heading */}
              <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3" style={{ letterSpacing: '-0.04em' }}>
                  Learn <span className="gradient-text">Anything</span>, Instantly.
                </h1>
                <p className="text-base" style={{ color: 'var(--text-muted)' }}>Type a topic. Get a full AI-generated course.</p>
              </div>

              {/* Topic Input Form */}
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Enter your topic</label>
                  <div className="gradient-border rounded-xl">
                    <textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="E.g., React Hooks, Machine Learning Basics, Spanish for Beginners..."
                      className="w-full h-28 p-4 rounded-xl resize-none outline-none text-sm"
                      style={{
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                      }}
                      disabled={loading}
                    />
                  </div>
                </div>
                {error && <p className="error-alert text-sm">{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-3"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Generate Course
                    </>
                  )}
                </button>
              </form>

              {/* Skeleton Loader */}
              {loading && (
                <div className="mt-8 space-y-4 animate-fadeIn">
                  <div className="skeleton h-8 w-3/4 rounded-lg" />
                  <div className="skeleton h-4 w-1/2 rounded-lg" />
                  <div className="skeleton h-24 w-full rounded-xl mt-4" />
                  <div className="skeleton h-24 w-full rounded-xl" />
                  <div className="skeleton h-24 w-full rounded-xl" />
                </div>
              )}

              {/* Suggested Topics (when empty) */}
              {!loading && courses.length === 0 && (
                <div className="mt-10 animate-fadeInUp delay-300">
                  <p className="text-center text-sm mb-4 flex items-center justify-center gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Sparkles className="w-4 h-4" /> Try a topic
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SUGGESTED_TOPICS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setTopic(t.replace(/^.{2}\s/, ''))}
                        className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 cursor-pointer"
                        style={{
                          background: 'var(--bg-elevated)',
                          border: '1px solid var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                          e.currentTarget.style.background = 'rgba(59,130,246,0.08)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.background = 'var(--bg-elevated)';
                          e.currentTarget.style.color = 'var(--text-secondary)';
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ===== GENERATED OUTLINE ===== */
            <div className="max-w-3xl mx-auto">
              <div className="card animate-scaleIn">
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{generatedOutline.title}</h2>
                <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{generatedOutline.description}</p>

                <div className="space-y-3">
                  {generatedOutline.modules?.map((module: any, idx: number) => (
                    <div key={idx}
                      className={`animate-fadeInUp delay-${(idx + 1) * 100} rounded-xl p-4 transition-all duration-200`}
                      style={{
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}>
                      <h3 className="font-semibold text-base mb-2 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'var(--gradient-primary)' }}>
                          {idx + 1}
                        </span>
                        <span className="gradient-text">{module.title}</span>
                      </h3>
                      <ul className="space-y-1 ml-8">
                        {module.lessons?.map((lesson: string, lessonIdx: number) => (
                          <li key={lessonIdx} className="text-sm flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--primary)', opacity: 0.5 }}>•</span>
                            {lesson}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save & Start Learning'
                    )}
                  </button>
                  <button onClick={() => setGeneratedOutline(null)} className="btn-secondary px-6">
                    New Topic
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Dashboard
