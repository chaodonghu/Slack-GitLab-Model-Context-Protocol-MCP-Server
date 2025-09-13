export interface ChannelInfo {
  ok: boolean;
  channel?: {
    is_archived: boolean;
  };
}

export interface GetUserActivityArgs {
  user_id: string;
  start?: number;
  end?: number;
}

export interface SummarizeActivityArgs {
  user_id: string;
  start?: number;
  end?: number;
}
