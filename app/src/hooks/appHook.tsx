import { useContext, createContext, useEffect, useState } from "react";
import { Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { ipcRenderer } from "electron";
import { AppStateType, DownloadQueueItem, DownloadTargets } from "src/type";

const useAppHook = () => {
  const [showList, setShowList] = useState<Show[]>([]);
  const [downloadTarget, setDownloadTarget] = useState<DownloadTargets>({})
  const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
  const [isLoadingShowList, setIsLoadingShowList] = useState(false);

  // state handler
  useEffect(() => {
    const callback = (_, data) => {
      const state = data as AppStateType;
      console.log(state);
      setShowList(state.showList);
      setDownloadTarget(state.downloadTarget);
    
      // show list is loading
      if ((state.showList|| []).length === 0) {
        window.Main.send("updateShowList");
        setIsLoadingShowList(true);
      } else {
        setIsLoadingShowList(false);
      }
    };

    window.Main.on("appStateUpdated", callback);
    window.Main.send("ready");
    return ()=> window.Main.off("appStateUpdated", callback)
  }, []);

  // queue handler
  useEffect(() => {
    const callback = (_, data) => {
      const queue = data as DownloadQueueItem[];
      setQueue(queue);
    }
    window.Main.on("queueUpdated", callback);
    return ()=> window.Main.off("queueUpdated", callback)
  }, []);
  


  const updateShowList = () => {
    window.Main.send("updateShowList");
    setIsLoadingShowList(true);
  }

  const updateDownloadTarget = (id: string, isTarget: boolean) => {
    window.Main.send("updateDownloadTarget", id, isTarget);
  }

  return {
    showList,
    isLoadingShowList,
    updateShowList,
    downloadTarget,
    updateDownloadTarget,
    queue,
  };
};

const AppContext = createContext<ReturnType<typeof useAppHook>>(
  undefined as unknown as ReturnType<typeof useAppHook>
);

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const values = useAppHook();

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};
