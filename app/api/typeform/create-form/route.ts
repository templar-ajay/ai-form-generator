import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, formInput } = body;

    if (!apiKey || !formInput) {
      return NextResponse.json(
        { error: "'apiKey' and 'formInput' are required." },
        { status: 400 }
      );
    }

    // Initialize the Gemini API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate content using the Gemini API
    const prompt = `Extract the questions and fields from the following input in Typeform's API JSON format:\n${formInput}
    also extract the form title from the given data if the form title is not provided then generate it depending on the content and add AI generated at the end
    the json required to create a form using the typeform api is as follows
    {
  "title": "Sample Form",
  "type": "form",
  "settings": {
    "language": "en",
    "is_public": true,
    "progress_bar": "proportion",
    "show_progress_bar": true,
    "show_typeform_branding": true
  },
  "fields": [
    {
      "title": "What is your favorite color?",
      "type": "multiple_choice",
      "ref": "favorite_color",
      "properties": {
        "choices": [
          {"label": "Red"},
          {"label": "Blue"},
          {"label": "Green"}
        ],
        "allow_multiple_selection": false,
        "randomize": false
      }
    }
  ]
}

please make sure to only return the json to the best of your understanding and nothing else
    `;
    const geminiResponse = await model.generateContent(prompt);

    if (!geminiResponse || !geminiResponse.response) {
      return NextResponse.json(
        { error: "Failed to process input using Gemini API." },
        { status: 500 }
      );
    }

    const extractedFields = JSON.parse(
      geminiResponse.response
        .text()
        .replaceAll("```json", "")
        .replaceAll("```", "")
    );

    console.log("extractedFields", JSON.stringify(extractedFields, null, 2));
    // console.log("geminiResponse", JSON.stringify(geminiResponse, null, 2));

    // Send extracted questions to Typeform API
    const TYPEFORM_API_URL = "https://api.typeform.com/forms";
    const typeformResponse = await fetch(TYPEFORM_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(extractedFields),
    });

    if (!typeformResponse.ok) {
      const typeformError = await typeformResponse.json();
      return NextResponse.json(
        { error: typeformError || "Failed to create form." },
        { status: typeformResponse.status }
      );
    }

    const formResult = await typeformResponse.json();
    return NextResponse.json(formResult);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
