import { Episode, Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { getShowDetail } from "@n-radio-downloader/downloader/dist/lib/show";
import { QueueManager } from "./queueManager";
import { eventBus, EventBusType } from "./eventBus";
import { DownloadTargets } from "src/type";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class EpisodeObserver {

  episodeCheckers: EpisodeChecker[] = [];
  showList: Show[] = [];
  downloadTarget: DownloadTargets = {};

  constructor() {
    eventBus.on(EventBusType.showListUpdated, (showList: Show[]) => {
      this.showList = showList;
      this.onUpdateDownloadTarget();
    })
    eventBus.on(EventBusType.downloadTargetUpdated, (downloadTarget: DownloadTargets) => {
      this.downloadTarget = downloadTarget;
      this.onUpdateDownloadTarget();
    })

    eventBus.on(EventBusType.checkAllEpisodes, async () => {
      for (const episodeChecker of this.episodeCheckers) {
        await episodeChecker.checkEpisode();
        await sleep(1_000);
      }
    })

    console.log("EpisodeObserver initialized")
  }

  onUpdateDownloadTarget() {
    console.log("onUpdateDownloadTarget")
    // check all show in the showList
    // - add episode checker if it is download target and not exist
    // - remove episode checker if not exist in downloadTarget
    for (const show of this.showList || []) {
      if ((this.downloadTarget || {})[show.id]) {
        const episodeCheckerExists = this.episodeCheckers.some(
          e => e.show.id === show.id
        );
        if (!episodeCheckerExists) {
          const episodeChecker = new EpisodeChecker(show);
          episodeChecker.checkEpisode();
          this.episodeCheckers.push(episodeChecker);
        }
      } else {
        const episodeChecker = this.episodeCheckers.find(
          e => e.show.id === show.id
        );
        if (episodeChecker) {
          episodeChecker.stop();
        }
      }
    }

    // remove stopped episode checker
    this.episodeCheckers = this.episodeCheckers.filter(
      e => !e.stopped
    )
  }
}

class EpisodeChecker {
  show: Show;
  lastCheckedAt: Date | null;
  episodes: Episode[] = [];
  stopped = false;

  constructor(show: Show) {
    this.show = show;
    this.lastCheckedAt = null;
  }

  stop() {
    this.stopped = true;
  }

  async checkEpisode() {
    console.log(`Checking episode for ${this.show.name} ...`)
    try {
      const showDetail = await getShowDetail(this.show.detailUrl);
      const { episodes } = showDetail
      // add episodes to this.episodes if not exist
      for (const episode of episodes) {
        const episodeExists = this.episodes.some(
          e => e.id === episode.id
        );
        if (!episodeExists) {
          console.log(`New episode found: ${episode.id} ${episode.title}`);
          this.episodes.push(episode);
          eventBus.emit(EventBusType.episodeAdded, episode, this.show);
        }
      }
    } finally {
      this.lastCheckedAt = new Date();
    }
  }
}
