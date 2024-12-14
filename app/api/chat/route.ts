import { loadResponses } from "@/app/data/loadResponses"; // Import the loadResponses function
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import countResponses from "@/app/actions/countResponses";

// Define the type for the dataset
type ResponseType = {
  [key: string]: any; // Replace with specific properties if known
};

// Global cache for responses with proper type
let cachedResponses: ResponseType[] | null = null;

// Function to refresh the cache (if needed)
function refreshCache() {
  cachedResponses = loadResponses() as ResponseType[]; // Typecast the result
}

// Conversation history variable to store the session's conversation context
let conversationHistory: string[] = [];  // Keeps track of conversation history

// General function to calculate the percentage or count based on the provided field and value(s)
function calculateMetric(
  responses: ResponseType[], // Array of responses
  field: string,             // The field in the response to analyze
  value?: string | string[], // The value(s) to filter by (optional)
  type: "percentage" | "count" = "percentage" // Specify whether to calculate percentage or count
): number {
  const totalResponses = responses.length;

  // Filter responses based on the value or values provided
  let filteredResponses: ResponseType[];
  if (value) {
    if (Array.isArray(value)) {
      filteredResponses = responses.filter(response =>
        value.includes(response[field])
      );
    } else {
      filteredResponses = responses.filter(response =>
        response[field] === value
      );
    }
  } else {
    filteredResponses = responses;
  }

  // Calculate based on type (percentage or count)
  if (type === "count") {
    return filteredResponses.length;
  } else if (type === "percentage") {
    return (filteredResponses.length / totalResponses) * 100;
  }
  
  return 0;
}

// Example Usage

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Load responses into cache if not already loaded
  if (!cachedResponses) {
    cachedResponses = loadResponses() as ResponseType[]; // Typecast the result
  }

  // Add the latest message to the conversation history
  conversationHistory.push(`User: ${messages[0].content}`);

  // Calculate percentage of students who feel overwhelmed (can also calculate count)
  const overwhelmedPercentage = calculateMetric(
    cachedResponses,
    "How often do you feel overwhelmed by your academic workload?",
    ["Often", "Always"],
    "percentage"
  );

  // Calculate the count of students who feel overwhelmed (optional)
  const overwhelmedCount = calculateMetric(
    cachedResponses,
    "How often do you feel overwhelmed by your academic workload?",
    ["Often", "Always"],
    "count"
  );

  // System message with calculated percentages and counts, including conversation history
  const systemMessage = `
  The dataset contains responses from university students about their academic stress and mental health management. 
  Here are some example responses: ${JSON.stringify(cachedResponses)}. 
  A percentage of ${overwhelmedPercentage}% of students reported feeling overwhelmed by their workload often or always, 
  with a total count of ${overwhelmedCount} students. 
  Please answer the following query based on these responses:

  --- Conversation history ---
  ${conversationHistory.join("\n")}
  `;

  const result = streamText({
    model: google("gemini-1.5-flash"),
    system: systemMessage,
    messages,
    tools: {
      count: tool({
        description: "Get the total count of responses",
        parameters: z.object({
          count: z.number().describe("The total count of responses"),
        }),
        execute: async () => {
          if (!cachedResponses) throw new Error("Responses not loaded");
          return { count: cachedResponses.length };
        },
      }),
    },
  });

  // Add the AI's response to the conversation history
  const aiResponse = await result.toDataStreamResponse();
  conversationHistory.push(`AI: ${aiResponse}`);

  return aiResponse;
}

// Optional: Add a PUT method to manually refresh the cache
export async function PUT(req: Request) {
  refreshCache();
  return new Response("Cache refreshed successfully.");
}