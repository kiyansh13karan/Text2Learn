/**
 * Gemini AI Service
 * Handles AI content generation using Google's Gemini API
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { CourseOutline, LessonContent } from "../types";

// Validate and clean API key on startup
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
// Remove quotes if present
GEMINI_API_KEY = GEMINI_API_KEY.replace(/^["']|["']$/g, "").trim();

if (
  !GEMINI_API_KEY ||
  GEMINI_API_KEY === "your-real-gemini-key-here" ||
  GEMINI_API_KEY === "YOUR_GEMINI_API_KEY_HERE"
) {
  console.error("❌ GEMINI_API_KEY is not configured!");
  console.error("   Please set a valid API key in server/.env");
  console.error(
    "   Get your API key from: https://makersuite.google.com/app/apikey"
  );
  console.error(`   Current value: "${process.env.GEMINI_API_KEY}"`);
} else {
  console.log(
    `✅ Gemini API Key loaded: ${GEMINI_API_KEY.slice(
      0,
      5
    )}...${GEMINI_API_KEY.slice(-5)} (length: ${
      GEMINI_API_KEY.length
    } characters)`
  );
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Using gemini-2.5-flash: This model is confirmed to be available and working for your API key.
const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

/**
 * Test Gemini API connection
 */
export const testGeminiConnection = async (): Promise<string> => {
  try {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "your-real-gemini-key-here") {
      throw new Error(
        "Gemini API key not configured. Please add a valid API key to .env file."
      );
    }

    console.log("🧪 Testing Gemini API connection...");
    const result = await model.generateContent(
      'Say "Hello from Gemini!" as plain text'
    );
    const text = result.response.text();

    console.log("✅ Gemini API test successful!");
    console.log("📝 Response:", text);

    return text;
  } catch (error: any) {
    console.error("❌ Gemini API test failed:", error);
    console.error("   Error details:", error.message);
    if (error.response) {
      console.error("   Response:", JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
};

/**
 * Generate a structured course outline from a topic
 */
export const generateCourseOutline = async (
  topic: string,
  moduleCount: number = 5,
  lessonCount: number = 4
): Promise<CourseOutline> => {
  const prompt = `You are an expert educational content creator. Create a comprehensive online course outline for the topic: "${topic}".

Requirements:
- Generate exactly ${moduleCount} modules
- Each module should have exactly ${lessonCount} lessons
- Course should progress from basics to advanced concepts
- Lessons should build on each other logically
- Use clear, descriptive titles

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{
  "title": "Course title",
  "description": "2-3 sentence course description",
  "modules": [
    {
      "title": "Module title",
      "description": "Module description",
      "lessons": ["Lesson 1 title", "Lesson 2 title", ...]
    }
  ]
}`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file"
      );
    }

    console.log(`🤖 Generating course for: "${topic}"`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log(
      "📝 Raw AI response received (length:",
      text.length,
      "characters)"
    );

    // Extract JSON from response (remove markdown code blocks if present)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "❌ Failed to extract JSON from response:",
        text.substring(0, 200)
      );
      throw new Error("Failed to extract JSON from AI response");
    }

    console.log("🔍 Parsing JSON response...");
    const courseOutline: CourseOutline = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      !courseOutline.title ||
      !courseOutline.modules ||
      !Array.isArray(courseOutline.modules)
    ) {
      console.error("❌ Invalid structure:", courseOutline);
      throw new Error("Invalid course outline structure");
    }

    console.log(
      `✅ Generated course: "${courseOutline.title}" with ${courseOutline.modules.length} modules`
    );
    return courseOutline;
  } catch (error: any) {
    console.error("❌ Gemini API error:", error);

    // Handle quota errors specifically
    if (error.message && error.message.includes("429")) {
      const quotaError = new Error(
        "Gemini API quota exceeded. Please wait a few minutes and try again. The free tier allows 1500 requests per day."
      );
      (quotaError as any).statusCode = 429;
      throw quotaError;
    }

    // Handle other API errors
    if (error.message && error.message.includes("API key")) {
      throw new Error(
        "Invalid Gemini API key. Please check your configuration."
      );
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate course outline");
  }
};

/**
 * Generate detailed lesson content with structured blocks
 */
export const generateLessonContent = async (
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  previousLessons: string[] = []
): Promise<LessonContent> => {
  const contextInfo =
    previousLessons.length > 0
      ? `\n\nPrevious lessons covered: ${previousLessons.join(
          ", "
        )}\nBuild on these concepts without repeating them.`
      : "";

  const prompt = `You are an expert instructor creating educational content for an online course.

Course: ${courseTitle}
Module: ${moduleTitle}
Lesson: ${lessonTitle}${contextInfo}

Create comprehensive lesson content with the following requirements:

1. Start with 2-3 clear learning objectives
2. Structure content using these block types:
   - heading: Section headings (level 1, 2, or 3)
   - paragraph: Explanatory text (2-4 sentences each)
   - code: Code examples with language specified
   - list: Bullet points or numbered lists
   - video: YouTube search query for relevant video
   - mcq: Multiple choice question with 4 options

3. Include 2-3 code examples if relevant to the topic
4. Include 1 YouTube video suggestion
5. Include 2-3 MCQs to test understanding
6. Estimate lesson duration in minutes

Return ONLY valid JSON (no markdown, no explanations):
{
  "title": "${lessonTitle}",
  "objectives": ["objective 1", "objective 2", "objective 3"],
  "estimatedMinutes": 15,
  "content": [
    { "type": "heading", "text": "Introduction", "level": 1 },
    { "type": "paragraph", "text": "Lesson introduction..." },
    { "type": "heading", "text": "Key Concepts", "level": 2 },
    { "type": "paragraph", "text": "Explanation..." },
    { "type": "code", "language": "javascript", "text": "console.log('example');" },
    { "type": "list", "items": ["Point 1", "Point 2"], "ordered": false },
    { "type": "video", "query": "Relevant YouTube search query" },
    { "type": "mcq", "question": "What is X?", "options": [
      { "text": "Option A", "isCorrect": false },
      { "text": "Option B", "isCorrect": true },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ], "explanation": "Why B is correct..." }
  ]
}`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error(
        "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file"
      );
    }

    console.log(`🤖 Generating lesson: "${lessonTitle}"`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log(
      "📝 Raw AI response received (length:",
      text.length,
      "characters)"
    );

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error(
        "❌ Failed to extract JSON from response:",
        text.substring(0, 200)
      );
      throw new Error("Failed to extract JSON from AI response");
    }

    console.log("🔍 Parsing JSON response...");
    const lessonContent: LessonContent = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      !lessonContent.title ||
      !lessonContent.content ||
      !Array.isArray(lessonContent.content)
    ) {
      console.error("❌ Invalid structure:", lessonContent);
      throw new Error("Invalid lesson content structure");
    }

    console.log(
      `✅ Generated lesson: "${lessonContent.title}" with ${lessonContent.content.length} content blocks`
    );
    return lessonContent;
  } catch (error: any) {
    console.error("❌ Gemini API error:", error);

    // Handle quota errors specifically
    if (error.message && error.message.includes("429")) {
      const quotaError = new Error(
        "Gemini API quota exceeded. Please wait a few minutes and try again. The free tier allows 1500 requests per day."
      );
      (quotaError as any).statusCode = 429;
      throw quotaError;
    }

    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to generate lesson content");
  }
};

/**
 * Generate Hinglish translation of English text (optional feature)
 */
export const translateToHinglish = async (
  englishText: string
): Promise<string> => {
  const prompt = `Translate the following English text to Hinglish (Hindi written in Latin script with English words mixed in naturally):

"${englishText}"

Return only the Hinglish translation, no explanations.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text().trim();
  } catch (error) {
    console.error("Translation error:", error);
    return englishText; // Fallback to original text
  }
};

/**
 * Translate course to target language
 */
export const translateCourse = async (
  courseData: any,
  targetLanguage: string
): Promise<any> => {
  const languageMap: { [key: string]: string } = {
    en: 'English',
    hi: 'Hindi',
    es: 'Spanish',
    fr: 'French',
    de: 'German'
  };

  const targetLangName = languageMap[targetLanguage] || targetLanguage;

  const prompt = `Translate the following course structure into ${targetLangName}. 
Maintain the exact JSON structure and formatting. Only translate the text content (title, description, lesson names), keep all field names in English.

${JSON.stringify(courseData, null, 2)}

Return ONLY the translated JSON object with no explanations or markdown:`;

  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    console.log(`🌐 Translating course to ${targetLangName}...`);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ Failed to extract JSON from translation response');
      throw new Error('Failed to extract JSON from translation response');
    }

    const translatedData = JSON.parse(jsonMatch[0]);
    console.log(`✅ Course translated to ${targetLangName}`);
    return translatedData;
  } catch (error: any) {
    console.error('❌ Translation error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to translate course');
  }
};
