import Event from "events";

export const eventBus = new Event();

export enum EventBusType {
  checkAllEpisodes = "checkAllEpisodes",
  showListUpdated = "showListUpdated",
  downloadTargetUpdated = "downloadTargetUpdated",
  episodeAdded = "episodeAdded",
  queueUpdated = "queueUpdated",
}
