import { Episode, Show } from "@n-radio-downloader/downloader/dist/lib/types";

export type AppStateType = {
  lastUpdated?: string;
  showList: Show[];
  downloadTarget: DownloadTargets;
}

export type DownloadTargets = {
  [key: string]: boolean;
}

export function initialAppState(): AppStateType {
  return {
    showList: [],
    downloadTarget: {},
  }
}

export type DownloadQueueItem = {
  show: Show;
  episode: Episode;
  finished: boolean,
  hasError: boolean,
  downloading: boolean,
}

export type DownloadQueueStateType = {
  queue: DownloadQueueItem[];
}

export function initialQueueState(): DownloadQueueStateType {
  return {
    queue: [],
  }
}
