
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No GEMINI_API_KEY found in .env");
  process.exit(1);
}

async function listModels() {
  console.log("🔍 Checking available Gemini models...");
  
  // Direct fetch because SDK might abstract listModels differently in some versions
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.models) {
        console.log("\n✅ Available Models:");
        data.models.forEach((m: any) => {
            // Filter for 'generateContent' supported models
            if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                console.log(`- ${m.name.replace('models/', '')} (${m.displayName})`);
            }
        });
        console.log("\n");
    } else {
        console.log("⚠️ No models found in response.");
    }

  } catch (error) {
    console.error("❌ Error listing models:", error);
  }
}

listModels();
