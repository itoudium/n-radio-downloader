import Event from "events";

export const eventBus = new Event();

export enum EventBusType {
  checkAllEpisodes = "checkAllEpisodes",
  showListUpdated = "showListUpdated",
  downloadTargetUpdated = "downloadTargetUpdated",
  downloadProgress = "downloadProgress",
  episodeAdded = "episodeAdded",
  queueUpdated = "queueUpdated",
  episodeChecking = "episodeChecking",
}
