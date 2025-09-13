## Slack Gitlab Digest Model Context Protocol MCP Server

A Model-Context-Protocol (MCP) server that retrieves Slack activity (messages, threads, replies), GitLab merge requests, and related comments, with summaries generated via OpenAI. Designed to help developers generate daily standups, weekly reports, or quarterly check-ins effortlessly.

## Features

- **Summarizes Slack activity** for a user in different timeframes (today, yesterday, day before yesterday, last week)
- **Captures all types of Slack activity** including direct messages, thread replies, and emoji reactions
- **GitLab Integration**: Includes detailed summaries of user's GitLab merge requests and comments.

## Setup

### Prerequisites

- Node.js (v18+)
- pnpm
- Slack API token with appropriate scopes
- OpenAI API key
- Gitlab Token

## 🚀 Getting Started

### 1. Environment Setup

First, you'll need to set up your environment variables. Create a file at `src/env/keys.ts`:

```typescript
export const OPENAI_API_KEY = "your_key_here";
export const SLACK_API_TOKEN = "your_key_here";
export const GITLAB_TOKEN = "your_key_here";

// Add any other keys you need
```

> ⚠️ **Security Note**: Storing API keys directly in source code is not recommended for production environments. This is only for local development and learning purposes. You can set the env var inline in the Cursor MCP interface as well.

### 2. Installation

```bash
npm install
# or
yarn install
```

## 3. Test with MCP inspector when developing -> currently you'll have to switch to the `dev` branch, i'm unable to get a build branch working locally

Create a `.env` file with

```bash
# Slack API Configuration
SLACK_API_TOKEN=key_here

# OpenAI API Configuration
OPENAI_API_KEY=key_here

# Gitlab API Configuration
GITLAB_TOKEN=key_here

```
- https://github.com/modelcontextprotocol/inspector

```bash
git checkout dev
pnpm install
npx @modelcontextprotocol/inspector start
```

### 4. When finished developing build the Server

```bash
npm run build
```

### 4. Adding to Cursor

This project is designed to be used as an MCP server in Cursor. Here's how to set it up:

1. Open Cursor
2. Go to `Cursor Settings > Features > MCP`
3. Click `+ Add New MCP Server`
4. Fill out the form:
   - **Name**: Daily Summarizer
   - **Type**: stdio
   - **Command**: `node /path/to/your/project/dist/index.js`

> 📘 **Tip**: You might need to use the full path to your project's built index.js file.

After adding the server, you should see your tools listed under "Available Tools". If not, try clicking the refresh button in the top right corner of the MCP server section.

For more details about MCP setup, check out the [Cursor MCP Documentation](https://docs.cursor.com/advanced/model-context-protocol).

## 📁 Project Structure

```
src/
├── tools/
│   ├── gitlab.ts        # GitLab integration tool
│   └── slack.ts         # Slack integration tool
├── types/
│   ├── slack.ts         # Type definitions for Slack
│   └── gitlab.ts        # Type definitions for GitLab
├── resources/
│   ├── slack.ts         # Slack resource management
│   ├── slackClient.ts   # Slack client setup
│   ├── openai.ts        # OpenAI resource management
│   └── gitlab.ts        # GitLab resource management
├── env/
│   └── keys.ts          # Environment configuration (add your API keys here!)
└── index.ts             # Main entry point
```
