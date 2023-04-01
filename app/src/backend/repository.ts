import Store from "electron-store"
import { AppStateType, DownloadQueueStateType } from "src/type";

const appStore = new Store<AppStateType>({
  name: "nRadio.state",
})

const queueStore = new Store<DownloadQueueStateType>({
  name: "nRadio.queue",
})

export const Repository = {
  saveAppState(state: AppStateType) {
    appStore.store = (state);
  },
  getAppState(): AppStateType {
    return appStore.store
  },
  saveDownloadQueueState(state: DownloadQueueStateType) {
    queueStore.store = (state);
  },
  getDownloadQueueState(): DownloadQueueStateType {
    return queueStore.store
  },
}
