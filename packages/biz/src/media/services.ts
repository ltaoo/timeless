import { request } from "@timeless/domains";
import { Result } from "@timeless/domains";
import { MediaTypes } from "@/constants/index";

export type MediaItem = {
  id: string;
  type: MediaTypes;
  name: string;
  poster_path: string;
  air_date?: string;
  episode_count_text?: string;
  full?: boolean;
  actors?: string;
  vote?: number;
};

export type PlayHistoryItem = {
  id: string;
  type: MediaTypes;
  media_id: string;
  name: string;
  poster_path: string;
  progress: number;
  duration: number;
  updated_at: string;
};

export function fetchMediaList(body: any) {
  return request.post<{ dataSource: MediaItem[]; total: number }>("/api/media/list", body);
}

export function fetchMediaListProcess(res: any) {
  if (res.error) {
    return Result.Err(res.error);
  }
  // If data is array
  if (Array.isArray(res.data)) {
    return Result.Ok(res.data);
  }
  // If data has dataSource
  if (res.data && Array.isArray(res.data.dataSource)) {
    return Result.Ok(res.data.dataSource);
  }
  return Result.Ok([]);
}

export function fetchPlayingHistories(body: any) {
  return request.post<{ dataSource: PlayHistoryItem[]; total: number }>("/api/history/list", body);
}

export function fetchPlayingHistoriesProcess(res: any) {
  if (res.error) {
    return Result.Err(res.error);
  }
  if (Array.isArray(res.data)) {
    return Result.Ok(res.data);
  }
  if (res.data && Array.isArray(res.data.dataSource)) {
    return Result.Ok(res.data.dataSource);
  }
  return Result.Ok([]);
}

export function deleteHistory(body: { history_id: string }) {
  return request.post("/api/history/delete", body);
}
