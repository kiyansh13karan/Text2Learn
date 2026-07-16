import { redisClient } from '../utils/redis';

const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

export const getCachedResult = async (key: string) => {
    try {
        const cached = await redisClient.get(key);
        return cached ? JSON.parse(cached) : null;
    } catch (error) {
        console.error('Redis cache get error:', error);
        return null; // Fallback to non-cached on error
    }
};

export const setCachedResult = async (key: string, data: any) => {
    try {
        await redisClient.setex(key, CACHE_TTL, JSON.stringify(data));
    } catch (error) {
        console.error('Redis cache set error:', error);
    }
};

export const generateCourseCacheKey = (topic: string, moduleCount: number, lessonCount: number) => {
    return `course:${topic.toLowerCase().trim()}:${moduleCount}:${lessonCount}`;
};

export const generateLessonCacheKey = (courseTitle: string, moduleTitle: string, lessonTitle: string) => {
    return `lesson:${courseTitle.toLowerCase().trim()}:${moduleTitle.toLowerCase().trim()}:${lessonTitle.toLowerCase().trim()}`;
};
