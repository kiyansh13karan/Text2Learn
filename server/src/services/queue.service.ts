import { Queue, Worker, Job as BullJob } from 'bullmq';
import { prisma } from '../utils/prisma';
import { generateCourseOutline, generateLessonContent } from './gemini.service';
import { redisClient } from '../utils/redis';
import { setCachedResult, generateCourseCacheKey, generateLessonCacheKey } from './cache.service';

// Create Queue
export const courseQueue = new Queue('course-generation', { connection: redisClient });

// Initialize Worker
const worker = new Worker('course-generation', async (job: BullJob) => {
    const { type, jobId, ...data } = job.data;
    
    // Mark job as active in DB
    await prisma.job.update({
        where: { id: jobId },
        data: { status: 'ACTIVE' }
    });

    try {
        let result;
        if (type === 'course_generation') {
            const { topic, moduleCount, lessonCount } = data;
            result = await generateCourseOutline(topic, moduleCount, lessonCount);
            await setCachedResult(generateCourseCacheKey(topic, moduleCount, lessonCount), result);
        } else if (type === 'lesson_generation') {
            const { courseTitle, moduleTitle, lessonTitle, previousLessons } = data;
            result = await generateLessonContent(courseTitle, moduleTitle, lessonTitle, previousLessons);
            await setCachedResult(generateLessonCacheKey(courseTitle, moduleTitle, lessonTitle), result);
        } else {
            throw new Error(`Unknown job type: ${type}`);
        }

        // Update DB with success
        await prisma.job.update({
            where: { id: jobId },
            data: { 
                status: 'COMPLETED',
                result: JSON.parse(JSON.stringify(result)) // ensure pure JSON
            }
        });
    } catch (error: any) {
        // Update DB with error
        await prisma.job.update({
            where: { id: jobId },
            data: { 
                status: 'FAILED',
                error: error.message || 'Unknown error occurred during generation'
            }
        });
        throw error;
    }
}, { connection: redisClient });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});

/**
 * Enqueue a generation job
 */
export const enqueueJob = async (userId: string, type: string, data: any) => {
    // 1. Create Job in DB
    const dbJob = await prisma.job.create({
        data: {
            userId,
            type,
            data,
            status: 'WAITING'
        }
    });

    // 2. Push to BullMQ
    await courseQueue.add(type, {
        jobId: dbJob.id,
        type,
        ...data
    });

    return dbJob.id;
};
