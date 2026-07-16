/**
 * Course Context Provider
 * Manages course generation and storage
 */

import { createContext, useContext, useState, ReactNode } from 'react'
import api, { getErrorMessage } from '../utils/api'
import { 
  Course, 
  CourseOutline, 
  LessonContent, 
  GenerateCourseRequest,
  GenerateLessonRequest,
  ApiResponse 
} from '../types'

interface CourseContextType {
  courses: Course[]
  currentCourse: Course | null
  loading: boolean
  generateCourse: (topic: string, moduleCount?: number, lessonCount?: number) => Promise<CourseOutline>
  generateLesson: (req: GenerateLessonRequest) => Promise<LessonContent>
  saveCourse: (outline: CourseOutline) => Promise<Course>
  fetchCourses: (searchQuery?: string) => Promise<void>
  fetchCourse: (courseId: string) => Promise<Course>
  deleteCourse: (courseId: string) => Promise<void>
  setCurrentCourse: (course: Course | null) => void
  shareCourse: (courseId: string) => Promise<string>
  fetchSharedCourse: (shareId: string) => Promise<Course>
  translateCourse: (courseId: string, language: string) => Promise<Course>
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export const useCourse = () => {
  const context = useContext(CourseContext)
  if (!context) {
    throw new Error('useCourse must be used within CourseProvider')
  }
  return context
}

export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(false)

  const pollJobStatus = async (jobId: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      const interval = setInterval(async () => {
        try {
          const response = await api.get(`/job/${jobId}`);
          const job = response.data.data;
          
          if (job.status === 'COMPLETED') {
            clearInterval(interval);
            resolve(job.result);
          } else if (job.status === 'FAILED') {
            clearInterval(interval);
            reject(new Error(job.error || 'Job failed'));
          }
          // else continue polling
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 2000);
    });
  };

  const generateCourse = async (
    topic: string,
    moduleCount = 5,
    lessonCount = 4
  ): Promise<CourseOutline> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<{ jobId: string }>>('/generate/course', {
        topic,
        moduleCount,
        lessonCount,
      } as GenerateCourseRequest);

      const jobId = response.data.data!.jobId;
      const result = await pollJobStatus(jobId);
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const generateLesson = async (req: GenerateLessonRequest): Promise<LessonContent> => {
    try {
      setLoading(true);
      const response = await api.post<ApiResponse<{ jobId: string }>>('/generate/lesson', req);
      const jobId = response.data.data!.jobId;
      const result = await pollJobStatus(jobId);
      return result;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  const saveCourse = async (outline: CourseOutline): Promise<Course> => {
    try {
      const response = await api.post<ApiResponse<Course>>('/courses', {
        title: outline.title,
        description: outline.description,
        outline,
      })
      
      const newCourse = response.data.data!
      setCourses([newCourse, ...courses])
      return newCourse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const fetchCourses = async (searchQuery?: string) => {
    try {
      setLoading(true)
      const url = searchQuery ? `/courses?q=${encodeURIComponent(searchQuery)}` : '/courses'
      const response = await api.get<ApiResponse<Course[]>>(url)
      setCourses(response.data.data || [])
    } catch (error) {
      throw new Error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const fetchCourse = async (courseId: string): Promise<Course> => {
    try {
      setLoading(true)
      const response = await api.get<ApiResponse<Course>>(`/courses/${courseId}`)
      const course = response.data.data!
      setCurrentCourse(course)
      return course
    } catch (error) {
      throw new Error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const deleteCourse = async (courseId: string) => {
    try {
      await api.delete(`/courses/${courseId}`)
      setCourses(courses.filter((c) => c.id !== courseId))
      if (currentCourse?.id === courseId) {
        setCurrentCourse(null)
      }
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const shareCourse = async (courseId: string): Promise<string> => {
    try {
      const response = await api.post<ApiResponse<{ shareId: string }>>(`/courses/${courseId}/share`)
      return response.data.data!.shareId
    } catch (error) {
      throw new Error(getErrorMessage(error))
    }
  }

  const fetchSharedCourse = async (shareId: string): Promise<Course> => {
    try {
      setLoading(true)
      const response = await api.get<ApiResponse<Course>>(`/courses/share/${shareId}`)
      return response.data.data!
    } catch (error) {
      throw new Error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const translateCourse = async (courseId: string, language: string): Promise<Course> => {
    try {
      setLoading(true)
      const response = await api.post<ApiResponse<Course>>(`/courses/${courseId}/translate?language=${language}`)
      const translatedCourse = response.data.data!
      
      // Update the course in the list
      setCourses(courses.map(c => c.id === courseId ? translatedCourse : c))
      if (currentCourse?.id === courseId) {
        setCurrentCourse(translatedCourse)
      }
      
      return translatedCourse
    } catch (error) {
      throw new Error(getErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  const value: CourseContextType = {
    courses,
    currentCourse,
    loading,
    generateCourse,
    generateLesson,
    saveCourse,
    fetchCourses,
    fetchCourse,
    deleteCourse,
    setCurrentCourse,
    shareCourse,
    fetchSharedCourse,
    translateCourse,
  }

  return <CourseContext.Provider value={value}>{children}</CourseContext.Provider>
}
