/**
 * SharedCourse Page — Premium Redesign
 * Public view of shared courses (no auth required)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourse } from '../context/CourseContext'
import { BookOpen, Loader, ArrowLeft, ExternalLink, Github } from 'lucide-react'
import type { Course } from '../types'

const SharedCourse = () => {
  const { shareId } = useParams<{ shareId: string }>()
  const navigate = useNavigate()
  const { fetchSharedCourse } = useCourse()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadSharedCourse = async () => {
      if (!shareId) return
      
      try {
        setLoading(true)
        const data = await fetchSharedCourse(shareId)
        setCourse(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared course')
      } finally {
        setLoading(false)
      }
    }

    loadSharedCourse()
  }, [shareId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center animate-fadeIn">
          <Loader className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Loading shared course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center max-w-md animate-scaleIn">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Course Not Found</h2>
          <p className="mb-6" style={{ color: 'var(--text-muted)' }}>{error || 'This course may have been removed or the link is invalid.'}</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }

  const outline = course.outline as any
  const totalLessons = outline.modules?.reduce((sum: number, mod: any) => sum + (mod.lessons?.length || 0), 0) || 0

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[30%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 sticky top-0" style={{ background: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Text2Learn</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="https://github.com/DineshDumka/Text2Learn" target="_blank" rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110" style={{ color: 'var(--text-muted)' }} title="View on GitHub">
                <Github className="w-5 h-5" />
              </a>
              <button onClick={() => navigate('/')} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button onClick={() => navigate('/signup')} className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3">
                Create Your Own
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Course Content */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Course Header */}
          <div className="card mb-8 animate-fadeInUp">
            <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: 'var(--gradient-subtle)', color: 'var(--primary)', border: '1px solid rgba(59,130,246,0.2)' }}>
              ✨ Shared Course
            </div>
            <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
              {outline.title || course.title}
            </h1>
            <p className="text-base mb-5" style={{ color: 'var(--text-muted)' }}>{outline.description || course.description}</p>
            <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span>📚 {outline.modules?.length || 0} Modules</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>📖 {totalLessons} Lessons</span>
              <span style={{ opacity: 0.3 }}>•</span>
              <span>Shared by a Text2Learn user</span>
            </div>
          </div>

          {/* Modules */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-4 animate-fadeInUp delay-100" style={{ color: 'var(--text-primary)' }}>Course Outline</h2>
            {outline.modules?.map((module: any, idx: number) => (
              <div key={idx} className={`card animate-fadeInUp delay-${(idx + 2) * 100}`}>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: 'var(--gradient-primary)' }}>
                    {idx + 1}
                  </span>
                  <span className="gradient-text">{module.title}</span>
                </h3>
                {module.description && (
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>{module.description}</p>
                )}
                <ul className="space-y-2">
                  {module.lessons?.map((lesson: string, lessonIdx: number) => (
                    <li key={lessonIdx} className="flex items-start gap-2.5" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--primary)', opacity: 0.5 }} />
                      <span className="text-sm">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 gradient-border rounded-2xl p-10 text-center animate-fadeInUp"
            style={{ background: 'rgba(15, 25, 35, 0.6)', backdropFilter: 'blur(12px)' }}>
            <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Want to create <span className="gradient-text">your own</span> course?
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Join Text2Learn and generate unlimited AI-powered courses for free
            </p>
            <button onClick={() => navigate('/signup')} className="btn-primary px-8 py-3.5 text-base">
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedCourse
