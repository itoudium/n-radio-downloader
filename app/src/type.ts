import { Episode, Show } from "@n-radio-downloader/downloader/dist/lib/types";

export type AppStateType = {
  lastUpdated?: string;
  showList: Show[];
  downloadTarget: DownloadTargets;
  downloadDirectory: string;
  selectedGenre?: string;
  isFilteredDownloadTarget?: boolean;
}

export type DownloadTargets = {
  [key: string]: boolean;
}

export function initialAppState({
  downloadDirectory,
}: {
  downloadDirectory: string;
}): AppStateType {
  return {
    showList: [],
    downloadTarget: {},
    downloadDirectory,
  }
}

export type DownloadQueueItem = {
  show: Show;
  episode: Episode;
  finished: boolean,
  hasError: boolean,
  updatedAt?: string,
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
