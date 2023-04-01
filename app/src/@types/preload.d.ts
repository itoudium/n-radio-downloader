import { api } from '../preload'

declare global {
  // eslint-disable-next-line
  interface Window {
    Main: typeof api
  }
}
