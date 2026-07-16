/**
 * Lesson View Page — Premium Redesign
 * Fixed dark theme, gradient progress, polished content blocks, animated interactions
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCourse } from '../context/CourseContext'
import { 
  BookOpen, ChevronLeft, Loader, Menu, X, 
  CheckCircle, Circle, PlayCircle, ArrowLeft, ArrowRight, Globe,
  Copy, Check, Clock
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const LessonView = () => {
  const { courseId, moduleIndex, lessonIndex } = useParams()
  const navigate = useNavigate()
  const { currentCourse, fetchCourse, generateLesson, loading, translateCourse } = useCourse()
  const [lessonContent, setLessonContent] = useState<any>(null)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set())
  const [currentLessonComplete, setCurrentLessonComplete] = useState(false)
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [translating, setTranslating] = useState(false)

  useEffect(() => {
    if (courseId) {
      fetchCourse(courseId)
      loadProgress()
    }
  }, [courseId])

  const loadProgress = () => {
    const saved = localStorage.getItem(`progress_${courseId}`)
    if (saved) {
      setCompletedLessons(new Set(JSON.parse(saved)))
    }
  }

  const saveProgress = (lessonKey: string) => {
    const updated = new Set(completedLessons)
    updated.add(lessonKey)
    setCompletedLessons(updated)
    localStorage.setItem(`progress_${courseId}`, JSON.stringify([...updated]))
  }

  const loadLesson = async () => {
    if (!currentCourse || moduleIndex === undefined || lessonIndex === undefined) return

    const module = currentCourse.outline.modules[Number(moduleIndex)]
    const lessonTitle = module?.lessons[Number(lessonIndex)]

    if (!lessonTitle) return

    const lessonKey = `${moduleIndex}-${lessonIndex}`
    setCurrentLessonComplete(completedLessons.has(lessonKey))

    try {
      const content = await generateLesson({
        courseTitle: currentCourse.title,
        moduleTitle: module.title,
        lessonTitle,
      })
      setLessonContent(content)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lesson')
    }
  }

  useEffect(() => {
    if (currentCourse) {
      loadLesson()
    }
  }, [currentCourse, moduleIndex, lessonIndex])

  const calculateProgress = () => {
    if (!currentCourse) return 0
    const totalLessons = currentCourse.outline.modules.reduce(
      (sum: number, module: any) => sum + module.lessons.length, 0
    )
    return Math.round((completedLessons.size / totalLessons) * 100)
  }

  const markComplete = () => {
    const lessonKey = `${moduleIndex}-${lessonIndex}`
    saveProgress(lessonKey)
    setCurrentLessonComplete(true)
  }

  const goToNextLesson = () => {
    if (!currentCourse) return
    const currentModIdx = Number(moduleIndex)
    const currentLesIdx = Number(lessonIndex)
    const currentModule = currentCourse.outline.modules[currentModIdx]
    
    if (currentLesIdx < currentModule.lessons.length - 1) {
      navigate(`/course/${courseId}/module/${currentModIdx}/lesson/${currentLesIdx + 1}`)
    } else if (currentModIdx < currentCourse.outline.modules.length - 1) {
      navigate(`/course/${courseId}/module/${currentModIdx + 1}/lesson/0`)
    }
  }

  const goToPreviousLesson = () => {
    if (!currentCourse) return
    const currentModIdx = Number(moduleIndex)
    const currentLesIdx = Number(lessonIndex)
    
    if (currentLesIdx > 0) {
      navigate(`/course/${courseId}/module/${currentModIdx}/lesson/${currentLesIdx - 1}`)
    } else if (currentModIdx > 0) {
      const prevModule = currentCourse.outline.modules[currentModIdx - 1]
      navigate(`/course/${courseId}/module/${currentModIdx - 1}/lesson/${prevModule.lessons.length - 1}`)
    }
  }

  const canGoNext = () => {
    if (!currentCourse) return false
    const currentModIdx = Number(moduleIndex)
    const currentLesIdx = Number(lessonIndex)
    const currentModule = currentCourse.outline.modules[currentModIdx]
    return currentLesIdx < currentModule.lessons.length - 1 || 
           currentModIdx < currentCourse.outline.modules.length - 1
  }

  const canGoPrevious = () => {
    const currentModIdx = Number(moduleIndex)
    const currentLesIdx = Number(lessonIndex)
    return currentModIdx > 0 || currentLesIdx > 0
  }

  const handleTranslate = async (language: string) => {
    if (!courseId) return
    
    const languageNames: Record<string, string> = {
      en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', de: 'German'
    }
    
    try {
      setTranslating(true)
      setShowLanguageMenu(false)
      toast.loading(`Translating to ${languageNames[language]}...`, { id: 'translate' })
      await translateCourse(courseId, language)
      setLessonContent(null)
      toast.success(`Course translated to ${languageNames[language]}!`, { id: 'translate' })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Translation failed'
      setError(errorMsg)
      toast.error(errorMsg, { id: 'translate' })
    } finally {
      setTranslating(false)
    }
  }

  if (!currentCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: 'var(--primary)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading course...</p>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const currentModule = currentCourse.outline.modules[Number(moduleIndex)]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)' }}>
      {/* ===== SIDEBAR ===== */}
      <aside 
        className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden fixed left-0 top-0 h-screen z-30 lg:sticky lg:top-0`}
        style={{ background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)' }}
      >
        <div className="h-full flex flex-col w-72">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Course Outline</h3>
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1 rounded-md transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
          {currentCourse.outline.modules.map((module: any, modIdx: number) => (
            <div key={modIdx} className="mb-5">
              <h4 className="font-semibold text-xs mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <span className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: 'var(--gradient-primary)', opacity: 0.8 }}>
                  {modIdx + 1}
                </span>
                <span className="truncate">{module.title}</span>
              </h4>
              <div className="space-y-0.5 ml-1">
                {module.lessons.map((lesson: string, lesIdx: number) => {
                  const lessonKey = `${modIdx}-${lesIdx}`
                  const isCompleted = completedLessons.has(lessonKey)
                  const isCurrent = modIdx === Number(moduleIndex) && lesIdx === Number(lessonIndex)
                  
                  return (
                    <button
                      key={lesIdx}
                      onClick={() => navigate(`/course/${courseId}/module/${modIdx}/lesson/${lesIdx}`)}
                      className="w-full text-left p-2 rounded-lg text-xs flex items-center gap-2 transition-all duration-200"
                      style={{
                        background: isCurrent ? 'rgba(59,130,246,0.1)' : 'transparent',
                        color: isCurrent ? 'var(--primary)' : isCompleted ? 'var(--success)' : 'var(--text-muted)',
                        fontWeight: isCurrent ? 500 : 400,
                        borderLeft: isCurrent ? '2px solid var(--primary)' : '2px solid transparent',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) e.currentTarget.style.background = 'transparent'; }}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 flex-shrink-0" />
                      )}
                      <span className="truncate">{lesson}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className={`flex-1 flex flex-col min-h-screen ${sidebarOpen ? 'lg:ml-0' : ''}`}>
        {/* Header */}
        <header className="sticky top-0 z-10" style={{ background: 'rgba(6,11,20,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)' }}>
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {!sidebarOpen && (
                  <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ color: 'var(--text-muted)' }}>
                    <Menu className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => navigate('/dashboard')} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                  <ChevronLeft className="w-4 h-4" />
                  Dashboard
                </button>
              </div>
              
              {/* Translation Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  disabled={translating}
                  className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3"
                  title="Translate Course"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{translating ? 'Translating...' : 'Translate'}</span>
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl py-1.5 z-20 animate-scaleIn"
                    style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
                    {[
                      { code: 'en', name: 'English', flag: '🇺🇸' },
                      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
                      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
                      { code: 'fr', name: 'French', flag: '🇫🇷' },
                      { code: 'de', name: 'German', flag: '🇩🇪' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleTranslate(lang.code)}
                        className="w-full text-left px-4 py-2 flex items-center gap-2.5 transition-colors text-sm"
                        style={{ color: 'var(--text-primary)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Course Title */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--gradient-primary)' }}>
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{currentCourse.title}</h1>
                <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                  Module {Number(moduleIndex) + 1} — {currentModule?.title}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span style={{ color: 'var(--text-muted)' }}>Course Progress</span>
                <span className="font-semibold gradient-text">{progress}%</span>
              </div>
              <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div 
                  className="progress-gradient h-1.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Lesson Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {loading ? (
              /* Skeleton Loading */
              <div className="space-y-4 animate-fadeIn">
                <div className="skeleton h-10 w-3/4 rounded-lg" />
                <div className="skeleton h-4 w-1/3 rounded-lg" />
                <div className="skeleton h-32 w-full rounded-xl mt-6" />
                <div className="skeleton h-6 w-full rounded-lg" />
                <div className="skeleton h-6 w-5/6 rounded-lg" />
                <div className="skeleton h-6 w-4/6 rounded-lg" />
                <div className="skeleton h-40 w-full rounded-xl mt-4" />
                <div className="skeleton h-6 w-full rounded-lg" />
                <div className="skeleton h-6 w-3/4 rounded-lg" />
              </div>
            ) : lessonContent ? (
              <div className="card animate-fadeInUp">
                {/* Lesson Title */}
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                    {lessonContent.title}
                  </h2>
                  {lessonContent.estimatedMinutes && (
                    <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                      <Clock className="w-4 h-4" />
                      Estimated time: {lessonContent.estimatedMinutes} minutes
                    </div>
                  )}
                </div>

                {/* Learning Objectives */}
                {lessonContent.objectives && (
                  <div className="rounded-xl p-5 mb-8" style={{
                    background: 'rgba(59,130,246,0.05)',
                    border: '1px solid rgba(59,130,246,0.15)',
                  }}>
                    <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--primary)' }}>
                      <PlayCircle className="w-5 h-5" />
                      Learning Objectives
                    </h3>
                    <ul className="space-y-2">
                      {lessonContent.objectives.map((obj: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--primary)' }} />
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Lesson Content Blocks */}
                <div className="space-y-5">
                  {lessonContent.content?.map((block: any, idx: number) => (
                    <ContentBlock key={idx} block={block} />
                  ))}
                </div>

                {/* Mark Complete Button */}
                {!currentLessonComplete && (
                  <div className="mt-10 rounded-xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                    <button
                      onClick={markComplete}
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark as Complete
                    </button>
                  </div>
                )}

                {currentLessonComplete && (
                  <div className="mt-10 rounded-xl p-5 text-center animate-scaleIn" style={{
                    background: 'var(--success-glow)',
                    border: '1px solid rgba(46,160,67,0.3)',
                  }}>
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                    <p className="font-semibold" style={{ color: 'var(--success)' }}>Lesson Completed! 🎉</p>
                  </div>
                )}
              </div>
            ) : error ? (
              <div className="card text-center">
                <p style={{ color: 'var(--error)' }}>{error}</p>
              </div>
            ) : null}

            {/* Navigation Buttons */}
            {lessonContent && (
              <div className="flex items-center justify-between mt-8 gap-4">
                <button
                  onClick={goToPreviousLesson}
                  disabled={!canGoPrevious()}
                  className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={goToNextLesson}
                  disabled={!canGoNext()}
                  className="btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Next Lesson
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

// ===== Content Block Renderer =====
const ContentBlock = ({ block }: { block: any }) => {
  switch (block.type) {
    case 'heading':
      const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements
      return (
        <HeadingTag className="text-2xl font-bold mt-8 mb-3" style={{
          color: 'var(--text-primary)',
          borderLeft: '3px solid var(--primary)',
          paddingLeft: '12px',
        }}>
          {block.text}
        </HeadingTag>
      )

    case 'paragraph':
      return <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', lineHeight: '1.8', maxWidth: '70ch' }}>{block.text}</p>

    case 'code':
      return <CodeBlock text={block.text} language={block.language} />

    case 'list':
      const ListTag = block.ordered ? 'ol' : 'ul'
      return (
        <ListTag className={`space-y-2 mb-4 ml-4 ${block.ordered ? 'list-decimal' : 'list-none'}`}>
          {block.items?.map((item: string, idx: number) => (
            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {!block.ordered && <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--primary)', opacity: 0.6 }} />}
              <span style={{ lineHeight: '1.7' }}>{item}</span>
            </li>
          ))}
        </ListTag>
      )

    case 'video':
      return <VideoBlock query={block.query} />

    case 'mcq':
      return <MCQBlock block={block} />

    default:
      return null
  }
}

// ===== Code Block with Copy =====
const CodeBlock = ({ text, language }: { text: string; language?: string }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative my-6 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2" style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: copied ? 'var(--success)' : 'var(--text-muted)' }}>
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto !rounded-none !border-none !m-0" style={{ background: '#0d1117' }}>
        <code style={{ color: '#e6edf3' }}>{text}</code>
      </pre>
    </div>
  )
}

// ===== Video Block =====
const VideoBlock = ({ query }: { query: string }) => {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/youtube/search`, {
          params: { q: query }
        })
        
        if (response.data.success && response.data.data.length > 0) {
          setVideoId(response.data.data[0].videoId)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to fetch video:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchVideo()
  }, [query])

  if (loading) {
    return (
      <div className="my-6 skeleton h-64 rounded-xl" />
    )
  }

  if (error || !videoId) {
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    
    return (
      <div className="my-6 rounded-xl p-5" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
        <div className="flex items-start gap-4">
          <PlayCircle className="w-8 h-8 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>📹 Recommended Video</h4>
            <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>
              Search YouTube for: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>"{query}"</span>
            </p>
            <a
              href={youtubeSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <PlayCircle className="w-4 h-4" />
              Search on YouTube
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="my-6">
      <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
        <iframe
          width="100%"
          height="400"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={query}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full"
        />
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>📹 {query}</p>
    </div>
  )
}

// ===== MCQ Component =====
const MCQBlock = ({ block }: { block: any }) => {
  const [selected, setSelected] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)

  return (
    <div className="rounded-xl p-6 my-6" style={{
      background: 'rgba(59,130,246,0.03)',
      border: '2px solid rgba(59,130,246,0.15)',
    }}>
      <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>📝 {block.question}</h4>
      <div className="space-y-2">
        {block.options?.map((option: any, idx: number) => (
          <button
            key={idx}
            onClick={() => {
              setSelected(idx)
              setShowAnswer(true)
            }}
            className="w-full text-left p-3.5 rounded-xl transition-all duration-200 text-sm"
            style={{
              background: showAnswer && option.isCorrect
                ? 'rgba(46,160,67,0.1)'
                : showAnswer && selected === idx && !option.isCorrect
                ? 'rgba(248,81,73,0.1)'
                : 'var(--bg-elevated)',
              border: `2px solid ${
                showAnswer && option.isCorrect
                  ? 'rgba(46,160,67,0.4)'
                  : showAnswer && selected === idx && !option.isCorrect
                  ? 'rgba(248,81,73,0.4)'
                  : 'var(--border)'
              }`,
              color: showAnswer && option.isCorrect
                ? 'var(--success)'
                : showAnswer && selected === idx && !option.isCorrect
                ? 'var(--error)'
                : 'var(--text-primary)',
            }}
            disabled={showAnswer}
          >
            {option.text}
          </button>
        ))}
      </div>
      {showAnswer && block.explanation && (
        <div className="mt-4 p-4 rounded-xl animate-fadeIn" style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.15)',
        }}>
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--primary)' }}>💡 Explanation:</p>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{block.explanation}</p>
        </div>
      )}
    </div>
  )
}

export default LessonView
