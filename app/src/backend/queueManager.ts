import { Episode, Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { downloadByM3U8 } from "@n-radio-downloader/downloader/dist/lib/downloader"
import { DownloadQueueItem } from "src/type";
import fs from "fs/promises"
import path from "path"
import { Repository } from "./repository";
import { eventBus, EventBusType } from "./eventBus";

// sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function escapeFileName(fileName: string): string {
  const escapeChars = /[\x00-\x1f\x7f\\/:*?"<>|]/g;
  return fileName.replace(escapeChars, '_');
}
export class QueueManager {

  queue: DownloadQueueItem[] = [];
  baseDir: string;

  // TODO: baseDir should be set by user
  constructor(baseDir = "temp") {
    this.queue = Repository.getDownloadQueueState().queue || [];
    this.baseDir = baseDir;

    this.worker();

    console.log("QueueManager initialized")

    eventBus.on(EventBusType.episodeAdded, (episode: Episode, show: Show) => {
      this.addEpisode(episode, show);
    });
  }

  setBaseDir(baseDir: string) {
    this.baseDir = baseDir;
  }

  getQueue() {
    return this.queue;
  }

  saveQueue() {
    Repository.saveDownloadQueueState({ queue: this.queue });
  }

  private addEpisode(episode: Episode, show: Show) {
    // add episode to queue if not exist
    const episodeExists = this.queue.some(
      e => e.show.id === show.id && e.episode.id === episode.id
    );
    if (!episodeExists) {
      this.queue.push({
        episode,
        show,
        finished: false,
        hasError: false,
        downloading: false,
      });
      this.saveQueue();
    }
  }

  private async worker() {
    // observe queue with infinite loop and download episode
    while (true) {
      const queueItem = this.queue.find(e => !e.finished && !e.hasError);
      if (queueItem) {
        // download episode
        try {
          console.log(`Downloading ... ${queueItem.episode.id} ${queueItem.episode.title}`);
          queueItem.downloading = true;
          eventBus.emit(EventBusType.queueUpdated, this.queue);
          const outputDir = path.join(this.baseDir, escapeFileName(queueItem.show.name));
          await fs.mkdir(outputDir, { recursive: true });
          await downloadByM3U8(queueItem.episode.url, {
            outputDir,
            fileName: `${queueItem.episode.id} ${escapeFileName(queueItem.episode.title)}`,
            progressFn: (progress) => {
              eventBus.emit(EventBusType.downloadProgress, queueItem.episode.id, progress);
            }
          })
          queueItem.finished = true;
          console.log(`Finished : ${queueItem.episode.id} ${queueItem.episode.title}`)
        } catch (e) {
          // set hasError to true
          queueItem.hasError = true;
          console.log(`download error : ${queueItem.episode.id} ${queueItem.episode.title}`)
          console.error(e);
        } finally {
          eventBus.emit(EventBusType.queueUpdated, this.queue);
          this.saveQueue();
        }
      }
      await sleep(10_000);
    }
  }
}
