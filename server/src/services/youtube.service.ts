/**
 * YouTube Service
 * Handles YouTube Data API v3 integration
 */

import { google } from 'googleapis';
import { YouTubeVideo } from '../types';

// Check YouTube API Key on startup
if (!process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY === 'your-real-youtube-key-here') {
  console.warn('⚠️  YOUTUBE_API_KEY is not configured!');
  console.warn('   Video embeds will show fallback UI with manual search links');
  console.warn('   Get your API key from: https://console.cloud.google.com/apis/credentials');
}

const youtube = google.youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY
});

/**
 * Search YouTube videos by query
 */
export const searchYouTubeVideos = async (
  query: string,
  maxResults: number = 5
): Promise<YouTubeVideo[]> => {
  try {
    console.log(`🔍 Searching YouTube for: "${query}" with API key: ${process.env.YOUTUBE_API_KEY ? 'SET' : 'NOT SET'}`);
    
    const response = await youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
      order: 'relevance',
      videoDuration: 'medium', // Prefer 4-20 minute videos
      relevanceLanguage: 'en',
      videoEmbeddable: 'true',
      safeSearch: 'strict'
    });

    if (!response.data.items) {
      return [];
    }

    const videos: YouTubeVideo[] = response.data.items.map((item) => ({
      videoId: item.id?.videoId || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || ''
    }));

    console.log(`✅ Found ${videos.length} YouTube videos for query: "${query}"`);
    return videos;
  } catch (error: any) {
    console.error('❌ YouTube API error:', error.message || error);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', error.response.data);
    }
    // Return empty array instead of throwing to allow graceful fallback
    return [];
  }
};

/**
 * Get video details by video ID
 */
export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
  try {
    const response = await youtube.videos.list({
      part: ['snippet', 'contentDetails'],
      id: [videoId]
    });

    if (!response.data.items || response.data.items.length === 0) {
      return null;
    }

    const item = response.data.items[0];
    return {
      videoId: item.id || '',
      title: item.snippet?.title || '',
      description: item.snippet?.description || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
      channelTitle: item.snippet?.channelTitle || '',
      publishedAt: item.snippet?.publishedAt || ''
    };
  } catch (error) {
    console.error('YouTube API error:', error);
    return null;
  }
};
