import { Tool } from "@modelcontextprotocol/sdk/types.js";

export const getGitlabMergeRequestsTool: Tool = {
  name: "gitlab_get_merge_requests",
  description:
    "Fetch merge requests from GitLab from a specific user for a specific timeframe",
  inputSchema: {
    type: "object",
    properties: {
      // full_paths: {
      //   type: ["array"],
      //   description:
      //     "Array of full paths of the gitlab project (eg. zapier/team-enterprise-experience/assetmanagement)",
      //   items: {
      //     type: "string",
      //   },
      // },
      // full_paths: {
      //   type: "string",
      //   description:
      //     "Array of full paths of the gitlab project (eg. zapier/team-enterprise-experience/assetmanagement)",
      // },
      username: {
        type: "string",
        description: "The username of the gitlab user",
      },
      from: {
        type: "string",
        description: "The start date of the timeframe",
      },
      to: {
        type: "string",
        description: "The end date of the timeframe",
      },
    },
    required: ["username"],
  },
};

export const getGitlabCommentsTool: Tool = {
  name: "gitlab_get_comments",
  description:
    "Fetch comments from GitLab from a specific user for a specific timeframe",
  inputSchema: {
    type: "object",
    properties: {
      // full_paths: {
      //   type: ["array"],
      //   description:
      //     "Array of full paths of the gitlab project (eg. zapier/team-enterprise-experience/assetmanagement)",
      //   items: {
      //     type: "string",
      //   },
      // },
      // full_paths: {
      //   type: "string",
      //   description:
      //     "Array of full paths of the gitlab project (eg. zapier/team-enterprise-experience/assetmanagement)",
      // },
      username: {
        type: "string",
        description: "The username of the gitlab user",
      },
      from: {
        type: "string",
        description: "The start date of the timeframe",
      },
      to: {
        type: "string",
        description: "The end date of the timeframe",
      },
    },
    required: ["username"],
  },
};

export const summarizeGitlabActivityTool: Tool = {
  name: "summarize_gitlab_activity",
  description: "Summarizes gitlab activity",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The username of the gitlab user",
      },
    },
    required: ["username"],
  },
};
