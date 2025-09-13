// src/summarize.ts
import OpenAI from "openai";
import { SlackActivity } from "./slack.js";
import { OPENAI_API_KEY } from "../env/keys.js";
// Set up the OpenAI client
const apiKey = OPENAI_API_KEY;
if (!apiKey) {
  console.error("OPENAI_API_KEY environment variable is not set");
  process.exit(1);
}

const openai = new OpenAI({
  apiKey,
  timeout: 100000, // Set timeout to 100 seconds (100000 milliseconds)
});

/**
 * Format the Slack activity into a text representation
 */
function formatActivityForSummarization(activity: SlackActivity): string {
  const { messages, reactions, replies } = activity;

  let text = `# Slack Activity Summary\n\n`;

  if (messages.length > 0) {
    text += `## Direct Messages\n\n`;
    messages.forEach((msg) => {
      text += `- In channel <#${msg.channel}>: "${msg.text}"\n`;
    });
    text += `\n`;
  }

  if (replies.length > 0) {
    text += `## Thread Replies\n\n`;
    replies.forEach((reply) => {
      text += `- Reply in thread (channel <#${reply.channel}>): "${reply.text}"\n`;
    });
    text += `\n`;
  }

  if (reactions.length > 0) {
    text += `## Reactions\n\n`;
    reactions.forEach(({ message, reaction }) => {
      text += `- Reacted with :${reaction}: to "${message.text}" in <#${message.channel}>\n`;
    });
  }

  return text;
}

// Function to add a timeout to a promise
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<T>((_, reject) =>
    setTimeout(() => reject(new Error("Request timed out")), ms)
  );
  return Promise.race([promise, timeout]);
}

/**
 * Summarize Slack messages using OpenAI
 */
export async function summarizeSlackMessages(
  activity: SlackActivity
): Promise<string> {
  try {
    // Format the activity data for the model
    const formattedActivity = formatActivityForSummarization(activity);

    // Use the withTimeout function to handle the API request
    const response = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that summarizes Slack activity. Create a concise summary of the user's Slack activity in the given time period. Focus on the main topics of discussion, any important information shared, and general themes of conversation. Group similar activities together.",
          },
          {
            role: "user",
            content: formattedActivity,
          },
        ],
        stream: true, // Enable streaming
      }),
      10000 // Set timeout to 10 seconds
    );

    let summary = "";
    for await (const chunk of response) {
      // Access the content from the delta
      const delta = chunk.choices[0]?.delta;
      if (delta && delta.content) {
        summary += delta.content;
      }
    }

    return summary || "No summary generated";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary due to an error.";
  }
}

/**
 * Format the GitLab merge request data into a text representation
 */
function formatMergeRequestsForSummarization(mergeRequests: any[]): string {
  let text = `# GitLab Merge Request Summary\n\n`;

  mergeRequests.forEach((mr) => {
    const { title, webUrl, createdAt, author } = mr;
    text += `- **Title**: ${title}\n`;
    text += `  **URL**: ${webUrl}\n`;
    text += `  **Created At**: ${new Date(createdAt).toLocaleString()}\n`;
    text += `  **Author**: ${author.username}\n\n`;
  });

  return text;
}

/**
 * Summarize GitLab merge requests using OpenAI
 */
export async function summarizeMergeRequests(
  mergeRequests: any[]
): Promise<string> {
  try {
    // Format the merge request data for the model
    const formattedMRs = formatMergeRequestsForSummarization(mergeRequests);

    console.error("formattedMRs", formattedMRs);

    // Create the model context and get the summary
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes GitLab merge request activity. Create a concise summary of the user's merge requests in the given time period. Focus on the main topics of the merge requests, any important changes, and general themes. Group similar requests together.",
        },
        {
          role: "user",
          content: formattedMRs,
        },
      ],
      stream: true,
    });

    let summary = "";
    for await (const chunk of response) {
      // Access the content from the delta
      const delta = chunk.choices[0]?.delta;
      if (delta && delta.content) {
        summary += delta.content;
      }
    }

    return summary || "No summary generated";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary due to an error.";
  }
}
