import { GITLAB_TOKEN } from "../env/keys.js";
interface FetchMergeRequestsArgs {
  fullPath: string;
  username: string;
  from?: string;
  to?: string;
}

interface FetchCommentsArgs {
  fullPath: string;
  username: string;
  from?: string;
  to?: string;
}
interface MergeRequestsResponse {
  data: {
    project: {
      mergeRequests: {
        nodes: Array<{
          title: string;
          webUrl: string;
          createdAt: string;
          author: {
            username: string;
          };
        }>;
      };
    };
  };
}

export class GitLabClient {
  private gitlabToken: string;

  constructor(gitlabToken: string) {
    // if (!gitlabToken) {
    //   console.error("GITLAB_TOKEN environment variable is not set");
    //   process.exit(1);
    // }

    // HARDCODED TOKEN FOR NOW
    this.gitlabToken = GITLAB_TOKEN;
  }

  // Hardcode the full path and username for now
  async fetchMergeRequests({
    fullPath,
    username,
    from,
    to,
  }: FetchMergeRequestsArgs) {
    const query = `
    query MergeRequestsByUser(
      $fullPath: ID!,
      $username: String!,
      $after: String,
      $from: Time,
      $to: Time,
    ) {
      project(fullPath: $fullPath) {
        mergeRequests(
          authorUsername: $username,
          createdAfter: $from,
          createdBefore: $to,
          first: 100,
          after: $after
        ) {
          pageInfo {
            endCursor
            hasNextPage
          }
          nodes {
            title
            webUrl
            createdAt
            author {
              username
            }
          }
        }
      }
    }
    `;

    const response = await fetch("https://gitlab.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.gitlabToken}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          username: username,
          fullPath: fullPath,
          from: from,
          to: to,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as MergeRequestsResponse;
    const nodes = data.data.project.mergeRequests.nodes;
    return nodes;
  }

  async getAllCommentsByUserInProject({
    fullPath,
    username,
    from,
    to,
  }: FetchCommentsArgs) {
    const userComments: any[] = [];

    const query = `
    query ProjectMergeRequests($fullPath: ID!, $username: String!, $from: Time, $to: Time) {
      project(fullPath: $fullPath) {
        mergeRequests(authorUsername:$username, createdAfter: $from, createdBefore: $to, first: 100) {
          nodes {
            iid
            title
            notes {
              nodes {
                author {
                  username
                }
                body
                createdAt
                id
              }
            }
          }
        }
      }
    }
    `;

    const response = await fetch("https://gitlab.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.gitlabToken}`,
      },
      body: JSON.stringify({
        query,
        variables: {
          fullPath: fullPath.toString(),
          username: username,
          from: from,
          to: to,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as {
      data: {
        project: {
          mergeRequests: {
            nodes: Array<{
              iid: number;
              title: string;
              notes: {
                nodes: Array<{
                  author: {
                    username: string;
                  };
                  body: string;
                  createdAt: string;
                  id: number;
                }>;
              };
            }>;
          };
        };
      };
    };

    const mergeRequests = data.data.project.mergeRequests.nodes;

    for (const mr of mergeRequests) {
      const matchingNotes = mr.notes.nodes.filter(
        (note: any) => note.author?.username === username
      );

      userComments.push(
        ...matchingNotes.map((note: any) => ({
          body: note.body,
          created_at: note.createdAt,
          url: `https://gitlab.com/${fullPath}/-/merge_requests/${mr.iid}#note_${note.id}`,
          mr_iid: mr.iid,
          mr_title: mr.title,
        }))
      );
    }

    return userComments;
  }
}
