// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'
import { AppStateType } from './type'

export const api = {
  send: (message: string, ...args: any[]) => {
    ipcRenderer.send(message, ...args)
  },
  on: (channel: string, callback: (event: IpcRendererEvent, data: Array<any>) => void) => {
    ipcRenderer.on(channel, callback)
  },
  off: (channel: string, callback: (event: IpcRendererEvent, data: Array<any>) => void) => {
    ipcRenderer.off(channel, callback)
  },
  getAppState: (): Promise<AppStateType> => ipcRenderer.invoke('getAppState')
}

contextBridge.exposeInMainWorld('Main', api)