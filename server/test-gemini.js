/**
 * Test script to verify Gemini API integration
 * Run with: node test-gemini.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testGeminiIntegration() {
  console.log('🧪 Testing Gemini AI Course Generation...\n');

  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const signupResponse = await axios.post(`${API_URL}/auth/signup`, {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'Test123456'
    });
    
    const token = signupResponse.data.data.token;
    console.log('✅ User created, token received\n');

    // Step 2: Generate course using Gemini
    console.log('2️⃣ Generating course for "React Hooks"...');
    const courseResponse = await axios.post(
      `${API_URL}/generate/course`,
      {
        topic: 'React Hooks',
        moduleCount: 3,
        lessonCount: 3
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Course generated successfully!\n');
    console.log('📚 Course Details:');
    console.log(JSON.stringify(courseResponse.data.data, null, 2));
    
    console.log('\n✅ Gemini AI course generation working perfectly! 🎉');
    return courseResponse.data.data;
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    console.error('\nFull error:', error.response?.data || error);
    process.exit(1);
  }
}

testGeminiIntegration();
