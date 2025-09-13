
export interface GetMergeRequestsArgs {
  full_paths?: string[];
  username: string;
  from?: string;
  to?: string;
}

export interface GetCommentsArgs {
  full_paths?: string[];
  username: string;
  from?: string;
  to?: string;
}

export interface SummarizeGitlabActivityArgs {
  username: string;
}
