import Event from "events";

export const eventBus = new Event();

export enum EventBusType {
  showListUpdated = "showListUpdated",
  downloadTargetUpdated = "downloadTargetUpdated",
  
  // episode observer
  checkAllEpisodes = "checkAllEpisodes",
  episodeAdded = "episodeAdded",
  episodeChecking = "episodeChecking",
  
  // queue manager
  queueUpdated = "queueUpdated",
  downloadProgress = "downloadProgress",
  downloadCancel = "downloadCancel",
}
