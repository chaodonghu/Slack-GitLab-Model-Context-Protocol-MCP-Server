import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import {
  getGitlabCommentsTool,
  getGitlabMergeRequestsTool,
  summarizeGitlabActivityTool,
} from "./tools/gitlab.js";

import {
  getSlackUserActivityTool,
  summarizeSlackActivityTool,
} from "./tools/slack.js";

import { GitLabClient } from "./resources/gitlab.js";

import {
  summarizeMergeRequests,
  summarizeSlackMessages,
} from "./resources/openai.js";

import { getUserActivity } from "./resources/slack.js";

import {
  GetMergeRequestsArgs,
  GetCommentsArgs,
  SummarizeGitlabActivityArgs,
} from "./types/gitlab.js";

import { GetUserActivityArgs, SummarizeActivityArgs } from "./types/slack.js";

// 1. Create an MCP server instance
const server = new Server(
  {
    name: "cursor-tools",
    version: "2.0.1",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// 2. Define the list of tools
const gitlabClient = new GitLabClient(process.env.GITLAB_TOKEN!);

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error("Received CallToolRequest:", request);
  try {
    if (!request.params.arguments) {
      throw new Error("No arguments provided");
    }

    switch (request.params.name) {
      case "slack_get_user_activity": {
        const args = request.params.arguments as unknown as GetUserActivityArgs;
        if (!args.user_id) {
          throw new Error("Missing required argument: user_id");
        }

        const response = await getUserActivity(
          // TODO: Add a date range picker for the timeframe
          args.user_id as string,
          args.start,
          args.end
        );

        return {
          content: [{ type: "text", text: JSON.stringify(response) }],
        };
      }

      case "summarize_slack_activity": {
        const args = request.params
          .arguments as unknown as SummarizeActivityArgs;
        if (!args.user_id) {
          throw new Error("Missing required argument: user_id");
        }

        const activity = await getUserActivity(
          args.user_id as string,
          args.start,
          args.end
        );
        const summary = await summarizeSlackMessages(activity);

        return {
          content: [{ type: "text", text: JSON.stringify(summary) }],
        };
      }

      case "gitlab_get_merge_requests": {
        const args = request.params
          .arguments as unknown as GetMergeRequestsArgs;
        if (!args.username) {
          throw new Error("Missing required argument: username");
        }

        // Hardcode full paths for now
        const fullPaths = args.full_paths || [
          "zapier/team-enterprise-experience/account-management",
          "zapier/team-enterprise-experience/assetmanagement",
          "zapier/team-enterprise-experience/zhwdailysummarizer",
          "zapier/team-enterprise-experience/reporting",
          "zapier/team-enterprise-experience/zap-management",
          "zapier/design-systems/design-system-bff",
        ];

        const mergeRequests = await Promise.all(
          fullPaths.map((fullPath) =>
            gitlabClient.fetchMergeRequests({
              fullPath,
              username: args.username,
              from: args.from,
              to: args.to,
            })
          )
        );

        const flattenedMergeRequests = mergeRequests?.flat();

        return {
          content: [
            { type: "text", text: JSON.stringify(flattenedMergeRequests) },
          ],
        };
      }

      case "gitlab_get_comments": {
        const args = request.params.arguments as unknown as GetCommentsArgs;
        if (!args.username) {
          throw new Error("Missing required argument: username");
        }

        // Hardcode full paths for now
        const fullPaths = args.full_paths || [
          "zapier/team-enterprise-experience/account-management",
          "zapier/team-enterprise-experience/assetmanagement",
          "zapier/team-enterprise-experience/zhwdailysummarizer",
          // "zapier/team-enterprise-experience/reporting",
          "zapier/team-enterprise-experience/zap-management",
          // "zapier/design-systems/design-system-bff",
        ];

        const gitlabComments = await Promise.all(
          fullPaths.map((fullPath) =>
            gitlabClient.getAllCommentsByUserInProject({
              fullPath,
              username: args.username,
              from: args.from,
              to: args.to,
            })
          )
        );

        const flattenedGitlabComments = gitlabComments?.flat();

        return {
          content: [
            { type: "text", text: JSON.stringify(flattenedGitlabComments) },
          ],
        };
      }

      case "summarize_gitlab_activity": {
        const args = request.params
          .arguments as unknown as SummarizeGitlabActivityArgs;
        if (!args.username) {
          throw new Error("Missing required argument: username");
        }

        // Hardcode full paths for now
        const fullPaths = [
          "zapier/team-enterprise-experience/account-management",
          "zapier/team-enterprise-experience/assetmanagement",
          "zapier/team-enterprise-experience/zhwdailysummarizer",
        ];

        const mergeRequests = await Promise.all(
          fullPaths.map((fullPath) =>
            gitlabClient.fetchMergeRequests({
              fullPath,
              username: args.username,
            })
          )
        );

        const flattenedMergeRequests = mergeRequests?.flat();

        const summary = await summarizeMergeRequests(flattenedMergeRequests);

        return {
          content: [{ type: "text", text: JSON.stringify(summary) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    console.error("Error executing tool:", error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          }),
        },
      ],
    };
  }
});

// 3. Implement the tool call logic
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error("Received ListToolsRequest");
  return {
    tools: [
      getGitlabCommentsTool,
      getGitlabMergeRequestsTool,
      getSlackUserActivityTool,
      summarizeGitlabActivityTool,
      summarizeSlackActivityTool,
    ],
  };
});

// 4. Start the MCP server with a stdio transport
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Tools MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
