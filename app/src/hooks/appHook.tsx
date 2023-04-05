import { useContext, createContext, useEffect, useState } from "react";
import { Show } from "@n-radio-downloader/downloader/dist/lib/types";
import { ipcRenderer } from "electron";
import { AppStateType, DownloadQueueItem, DownloadTargets } from "src/type";

const TimerInterval  = 1000 * 60 * 10;
// interval for checking episode
const CheckInterval = 1000 * 60 * 30;

let lastUpdatedAt = new Date();

const useAppHook = () => {
  const [showList, setShowList] = useState<Show[]>([]);
  const [downloadTarget, setDownloadTarget] = useState<DownloadTargets>({})
  const [queue, setQueue] = useState<DownloadQueueItem[]>([]);
  const [isLoadingShowList, setIsLoadingShowList] = useState(false);
  const [downloadDir, setDownloadDir] = useState<string>();
  const [isFilteredDownloadTarget, setIsFilteredDownloadTarget] =
    useState(false);
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(
    undefined
  );

  // setup state change handler
  useEffect(() => {
    const callback = (_, data) => {
      const state = data as AppStateType;
      console.log(state);
      setShowList(state.showList);
      setDownloadTarget(state.downloadTarget);
      setDownloadDir(state.downloadDirectory);
      setIsFilteredDownloadTarget(state.isFilteredDownloadTarget);
      setSelectedGenre(state.selectedGenre);
    
      // show list is loading
      if ((state.showList|| []).length === 0) {
        window.Main.send("updateShowList");
        setIsLoadingShowList(true);
        lastUpdatedAt = new Date();
      } else {
        setIsLoadingShowList(false);
      }
    };

    window.Main.on("appStateUpdated", callback);
    window.Main.send("ready");
    return ()=> window.Main.off("appStateUpdated", callback)
  }, []);

  // check episode by interval
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getTime() - lastUpdatedAt.getTime() > CheckInterval) {
        window.Main.send("checkAllEpisodes")
        lastUpdatedAt = new Date();
      }
    }, TimerInterval);
    return () => clearInterval(timer);
  }, [])

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
    downloadDir,
    selectedGenre,
    setSelectedGenre: (genre: string) => {
      window.Main.send("applyConfig", { selectedGenre: genre })
      setSelectedGenre(genre);
    },
    isFilteredDownloadTarget,
    setIsFilteredDownloadTarget: (isFiltered: boolean) => {
      window.Main.send("applyConfig", { isFilteredDownloadTarget: isFiltered })
      setIsFilteredDownloadTarget(isFiltered);
    },
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
