// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { NextResponse } from "next/server";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function POST(req) {
//   try {
//     const { prompt } = await req.json();

//     if (!prompt) {
//       return NextResponse.json(
//         { error: "Prompt is required" },
//         { status: 400 }
//       );
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const systemPrompt = `You are an event planning assistant. Generate event details based on the user's description.

// CRITICAL: Return ONLY valid JSON with properly escaped strings. No newlines in string values - use spaces instead.

// Return this exact JSON structure:
// {
//   "title": "Event title (catchy and professional, single line)",
//   "description": "Detailed event description in a single paragraph. Use spaces instead of line breaks. Make it 2-3 sentences describing what attendees will learn and experience.",
//   "category": "One of: tech, music, sports, art, food, business, health, education, gaming, networking, outdoor, community",
//   "suggestedCapacity": 50,
//   "suggestedTicketType": "free"
// }

// User's event idea: ${prompt}

// Rules:
// - Return ONLY the JSON object, no markdown, no explanation
// - All string values must be on a single line with no line breaks
// - Use spaces instead of \\n or line breaks in description
// - Make title catchy and under 80 characters
// - Description should be 2-3 sentences, informative, single paragraph
// - suggestedTicketType should be either "free" or "paid"
// `;

//     const result = await model.generateContent(systemPrompt);

//     const response = await result.response;
//     const text = response.text();

//     // Clean the response (remove markdown code blocks if present)
//     let cleanedText = text.trim();
//     if (cleanedText.startsWith("```json")) {
//       cleanedText = cleanedText
//         .replace(/```json\n?/g, "")
//         .replace(/```\n?/g, "");
//     } else if (cleanedText.startsWith("```")) {
//       cleanedText = cleanedText.replace(/```\n?/g, "");
//     }

//     console.log(cleanedText);

//     const eventData = JSON.parse(cleanedText);

//     return NextResponse.json(eventData);
//   } catch (error) {
//     console.error("Error generating event:", error);
//     return NextResponse.json(
//       { error: "Failed to generate event" + error.message },
//       { status: 500 }
//     );
//   }
// }


import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: "https://api.perplexity.ai",
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are an event planning assistant.

CRITICAL:
- Return ONLY valid JSON
- No markdown
- No explanations
- No line breaks inside string values
- Use spaces instead of \\n

JSON FORMAT:
{
  "title": "Event title",
  "description": "2-3 sentence single paragraph description",
  "category": "tech | music | sports | art | food | business | health | education | gaming | networking | outdoor | community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free or paid"
}

User idea: ${prompt}
`;

    const completion = await client.chat.completions.create({
  model: "sonar-pro",
  messages: [
    {
      role: "system",
      content: `
You are an event planning assistant.

CRITICAL:
- Return ONLY valid JSON
- No markdown
- No explanations
- No line breaks inside string values
- Use spaces instead of \\n

JSON FORMAT:
{
  "title": "Event title",
  "description": "2-3 sentence single paragraph description",
  "category": "tech | music | sports | art | food | business | health | education | gaming | networking | outdoor | community",
  "suggestedCapacity": 50,
  "suggestedTicketType": "free or paid"
}
`
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.4,
});


    const text = completion.choices[0].message.content.trim();

    const eventData = JSON.parse(text);

    return NextResponse.json(eventData);

  } catch (error) {
    console.error("Perplexity API Error:", error);

    return NextResponse.json(
      { error: "Failed to generate event" },
      { status: 500 }
    );
  }
}
