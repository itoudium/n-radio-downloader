import { app, BrowserWindow, ipcMain } from 'electron'
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

// import Store from "electron-store"

import { getShowList } from "@n-radio-downloader/downloader/lib/show";
import { AppStateType, DownloadQueueItem, initialAppState } from './type';
import { Repository } from './backend/repository';

import { eventBus, EventBusType } from './backend/eventBus';
import { EpisodeObserver } from "./backend/episodeObserver";
const episodeObserver = new EpisodeObserver();
import { QueueManager } from "./backend/queueManager";
const queueManager = new QueueManager();

// Store.initRenderer();

const Store = {
  appState: initialAppState(),
  queue: [] as DownloadQueueItem[],
}

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

const createWindow = async (): Promise<void> => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  // load appState from repository
  Store.appState = Repository.getAppState() || initialAppState();


  //
  // event handlers
  //

  eventBus.on(EventBusType.queueUpdated, (queue) => {
    console.log("queueUpdated");
  })

  const appStateUpdated = (value: AppStateType) => {
    mainWindow.webContents.send("appStateUpdated", value);
  }

  const queueUpdated = (value: DownloadQueueItem[]) => {
    mainWindow.webContents.send("queueUpdated", value);
  }

  ipcMain.on("updateShowList", async () => {
    console.log("updateShowList")
    const showList = await getShowList();
    Store.appState.showList = showList;
    appStateUpdated(Store.appState);
    Repository.saveAppState(Store.appState);
    eventBus.emit(EventBusType.showListUpdated, Store.appState.showList);
  })

  ipcMain.on("updateDownloadTarget", (event, id: string, isTarget: boolean) => {
    console.log("updateDownloadTarget", id, isTarget);
    Store.appState.downloadTarget = { ...(Store.appState.downloadTarget || {}), [id]: isTarget }
    appStateUpdated(Store.appState);
    Repository.saveAppState(Store.appState);
    eventBus.emit(EventBusType.downloadTargetUpdated, Store.appState.downloadTarget);
  });

  ipcMain.on("ready", () => {
    appStateUpdated(Store.appState);
    Store.queue = queueManager.queue;
    queueUpdated(Store.queue);
    eventBus.emit(EventBusType.showListUpdated, Store.appState.showList);
    eventBus.emit(EventBusType.downloadTargetUpdated, Store.appState.downloadTarget);
  })

  eventBus.on(EventBusType.queueUpdated, (queue) => {
    queueUpdated(queue);
  });

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.